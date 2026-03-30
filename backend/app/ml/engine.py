"""
NEXORA AI Recommendation Engine
================================
Implements a Hybrid Recommendation System combining:
1. Collaborative Filtering (SVD-based matrix factorization via scipy)
2. Content-Based Filtering (TF-IDF + Cosine Similarity)
3. Hybrid Ensemble (weighted combination)
4. Popularity-based fallback for cold-start users
"""
import os
import pickle
import logging
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Optional, Tuple
from uuid import UUID

import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix
from scipy.sparse.linalg import svds
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler

logger = logging.getLogger(__name__)

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)


class CollaborativeFilteringModel:
    """
    SVD-based collaborative filtering.
    
    Builds a User-Item matrix from interaction data,
    then uses Singular Value Decomposition to find latent factors.
    
    Interaction weights:
        view=1, click=2, add_to_cart=3, review=4, purchase=5
    """

    def __init__(self, n_factors: int = 50):
        self.n_factors = n_factors
        self.user_factors: Optional[np.ndarray] = None    # U matrix
        self.item_factors: Optional[np.ndarray] = None    # Vt matrix
        self.sigma: Optional[np.ndarray] = None           # Σ diagonal
        self.user_index: Dict[str, int] = {}              # user_id → matrix row
        self.item_index: Dict[str, int] = {}              # product_id → matrix col
        self.is_trained = False

    def train(self, interactions_df: pd.DataFrame) -> None:
        """
        Train the SVD model.
        
        Args:
            interactions_df: DataFrame with columns [user_id, product_id, weight]
        """
        if interactions_df.empty or len(interactions_df) < 10:
            logger.warning("Not enough interactions to train collaborative model")
            return

        logger.info(f"Training collaborative filter on {len(interactions_df)} interactions...")

        # Build index mappings
        unique_users = interactions_df["user_id"].unique()
        unique_items = interactions_df["product_id"].unique()
        self.user_index = {uid: i for i, uid in enumerate(unique_users)}
        self.item_index = {pid: i for i, pid in enumerate(unique_items)}

        # Aggregate weights (user may have multiple interactions with same product)
        agg = (interactions_df
               .groupby(["user_id", "product_id"])["weight"]
               .sum()
               .reset_index())

        # Build sparse User-Item matrix
        rows = agg["user_id"].map(self.user_index)
        cols = agg["product_id"].map(self.item_index)
        data = agg["weight"].values
        matrix = csr_matrix(
            (data, (rows, cols)),
            shape=(len(unique_users), len(unique_items)),
            dtype=np.float32
        )

        # SVD decomposition
        k = min(self.n_factors, min(matrix.shape) - 1)
        U, sigma, Vt = svds(matrix.toarray(), k=k)

        # Sort by singular values (descending)
        idx = np.argsort(sigma)[::-1]
        self.sigma = sigma[idx]
        self.user_factors = U[:, idx]
        self.item_factors = Vt[idx, :]
        self.is_trained = True

        logger.info(f"✅ Collaborative model trained: {len(unique_users)} users × {len(unique_items)} items, k={k}")

    def predict_for_user(self, user_id: str, top_n: int = 20,
                          exclude_products: Optional[List[str]] = None) -> List[Tuple[str, float]]:
        """
        Get top-N product recommendations for a user.
        Returns list of (product_id, score) tuples.
        """
        if not self.is_trained or user_id not in self.user_index:
            return []

        exclude = set(exclude_products or [])
        user_idx = self.user_index[user_id]

        # Reconstruct predicted ratings for this user
        user_vec = self.user_factors[user_idx, :] * self.sigma
        scores = user_vec @ self.item_factors  # (n_items,)

        # Map scores back to product IDs
        item_id_map = {v: k for k, v in self.item_index.items()}
        ranked = sorted(
            [(item_id_map[i], float(scores[i])) for i in range(len(scores))
             if item_id_map[i] not in exclude],
            key=lambda x: x[1], reverse=True
        )
        return ranked[:top_n]

    def save(self, path: str) -> None:
        with open(path, "wb") as f:
            pickle.dump(self, f)

    @classmethod
    def load(cls, path: str) -> "CollaborativeFilteringModel":
        with open(path, "rb") as f:
            return pickle.load(f)


class ContentBasedModel:
    """
    TF-IDF Content-Based Filtering.
    
    Builds product feature vectors from:
        - Product name
        - Description  
        - Category name
        - Brand
        - Tags
        - Attributes (color, size, etc.)
    
    Uses cosine similarity to find similar products.
    """

    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            stop_words="english",
            sublinear_tf=True,
        )
        self.product_matrix: Optional[np.ndarray] = None
        self.product_index: Dict[str, int] = {}
        self.is_trained = False

    def _build_feature_text(self, row: pd.Series) -> str:
        """Combine product features into a single text document."""
        parts = []

        name = str(row.get("name", ""))
        # Repeat name for higher weight
        parts.extend([name] * 3)

        if row.get("brand"):
            parts.extend([str(row["brand"])] * 2)

        if row.get("category_name"):
            parts.extend([str(row["category_name"])] * 2)

        if row.get("description"):
            # Truncate long descriptions
            parts.append(str(row["description"])[:500])

        if row.get("tags") and isinstance(row["tags"], list):
            parts.extend(row["tags"])

        if row.get("attributes") and isinstance(row["attributes"], dict):
            for k, v in row["attributes"].items():
                parts.append(f"{k} {v}")

        return " ".join(parts).lower()

    def train(self, products_df: pd.DataFrame) -> None:
        """
        Train the content-based model.
        
        Args:
            products_df: DataFrame with product fields
        """
        if products_df.empty:
            logger.warning("No products to train content model")
            return

        logger.info(f"Training content-based model on {len(products_df)} products...")

        self.product_index = {pid: i for i, pid in enumerate(products_df["id"])}
        feature_texts = products_df.apply(self._build_feature_text, axis=1)
        self.product_matrix = self.vectorizer.fit_transform(feature_texts)
        self.is_trained = True

        logger.info(f"✅ Content model trained: {self.product_matrix.shape[1]} features")

    def get_similar_products(self, product_id: str, top_n: int = 20,
                              exclude_products: Optional[List[str]] = None) -> List[Tuple[str, float]]:
        """
        Find products most similar to the given product.
        Returns list of (product_id, score) tuples.
        """
        if not self.is_trained or product_id not in self.product_index:
            return []

        exclude = set(exclude_products or [product_id])
        idx = self.product_index[product_id]
        product_vec = self.product_matrix[idx]

        # Compute cosine similarity against all products
        similarities = cosine_similarity(product_vec, self.product_matrix).flatten()

        item_id_map = {v: k for k, v in self.product_index.items()}
        ranked = sorted(
            [(item_id_map[i], float(similarities[i])) for i in range(len(similarities))
             if item_id_map[i] not in exclude],
            key=lambda x: x[1], reverse=True
        )
        return ranked[:top_n]

    def save(self, path: str) -> None:
        with open(path, "wb") as f:
            pickle.dump(self, f)

    @classmethod
    def load(cls, path: str) -> "ContentBasedModel":
        with open(path, "rb") as f:
            return pickle.load(f)


class HybridRecommendationEngine:
    """
    Hybrid recommendation engine combining collaborative and content-based filtering.
    
    Strategy:
    - New users (cold start): Trending/popular products
    - Warm users (<5 interactions): Mostly content-based
    - Active users (≥5 interactions): Weighted hybrid
    
    Weights can be tuned via config.
    """

    COLLAB_WEIGHT = 0.6
    CONTENT_WEIGHT = 0.4

    def __init__(self):
        self.collab_model = CollaborativeFilteringModel()
        self.content_model = ContentBasedModel()
        self.popular_products: List[str] = []   # Fallback for cold start
        self.trending_products: List[str] = []   # Recent high-interaction products
        self.scaler = MinMaxScaler()
        self.last_trained: Optional[datetime] = None

    def train(self, interactions_df: pd.DataFrame, products_df: pd.DataFrame) -> None:
        """
        Train both sub-models.
        
        Args:
            interactions_df: DataFrame[user_id, product_id, weight, created_at]
            products_df: DataFrame with product information
        """
        logger.info("🤖 Training Hybrid Recommendation Engine...")

        # Train collaborative model
        self.collab_model.train(interactions_df)

        # Train content model
        self.content_model.train(products_df)

        # Compute popular products (by total interaction weight)
        if not interactions_df.empty:
            popularity = (interactions_df
                          .groupby("product_id")["weight"]
                          .sum()
                          .sort_values(ascending=False))
            self.popular_products = popularity.index.tolist()

            # Trending = high interactions in last 7 days
            cutoff = datetime.now(timezone.utc) - timedelta(days=7)
            if "created_at" in interactions_df.columns:
                recent = interactions_df[interactions_df["created_at"] >= cutoff]
                trending = (recent.groupby("product_id")["weight"]
                            .sum()
                            .sort_values(ascending=False))
                self.trending_products = trending.index.tolist()

        self.last_trained = datetime.now(timezone.utc)
        logger.info("✅ Hybrid engine training complete")
        self._save_models()

    def recommend_for_user(
        self,
        user_id: str,
        user_interaction_count: int,
        recently_viewed: Optional[List[str]] = None,
        purchased_products: Optional[List[str]] = None,
        top_n: int = 10,
    ) -> List[Dict]:
        """
        Generate personalized recommendations for a user.
        
        Returns:
            List of dicts: {product_id, score, reason_type}
        """
        exclude = set((purchased_products or []))
        recently_viewed = recently_viewed or []

        # Cold start: no interaction history
        if user_interaction_count < 3 or not self.collab_model.is_trained:
            logger.debug(f"Cold start for user {user_id}, returning popular products")
            return self._build_result(
                [(pid, 1.0 - i * 0.01) for i, pid in enumerate(self.trending_products[:top_n])
                 if pid not in exclude],
                reason="trending"
            )

        # Get scores from collaborative model
        collab_scores = dict(
            self.collab_model.predict_for_user(user_id, top_n=top_n * 3, exclude_products=list(exclude))
        )

        # Get content-based scores from recently viewed products
        content_scores: Dict[str, float] = {}
        if recently_viewed and self.content_model.is_trained:
            for viewed_pid in recently_viewed[:5]:
                similar = self.content_model.get_similar_products(
                    viewed_pid, top_n=top_n * 2, exclude_products=list(exclude)
                )
                for pid, score in similar:
                    content_scores[pid] = max(content_scores.get(pid, 0), score)

        # Normalize scores to [0, 1]
        def normalize(d: Dict[str, float]) -> Dict[str, float]:
            if not d:
                return {}
            vals = np.array(list(d.values())).reshape(-1, 1)
            normed = MinMaxScaler().fit_transform(vals).flatten()
            return {k: float(v) for k, v in zip(d.keys(), normed)}

        collab_norm = normalize(collab_scores)
        content_norm = normalize(content_scores)

        # Combine all candidate products
        all_products = set(collab_norm) | set(content_norm)
        combined: Dict[str, float] = {}
        for pid in all_products:
            if pid in exclude:
                continue
            c_score = collab_norm.get(pid, 0.0)
            ct_score = content_norm.get(pid, 0.0)
            # Determine weighting based on user maturity
            if user_interaction_count >= 10:
                final = self.COLLAB_WEIGHT * c_score + self.CONTENT_WEIGHT * ct_score
                reason = "hybrid"
            else:
                # Fewer interactions → lean more on content
                final = 0.4 * c_score + 0.6 * ct_score
                reason = "content"
            combined[pid] = final

        # Sort and return top N
        ranked = sorted(combined.items(), key=lambda x: x[1], reverse=True)[:top_n]
        return self._build_result(ranked, reason=reason if ranked else "popular")

    def get_similar_products(self, product_id: str, top_n: int = 8) -> List[Dict]:
        """Get products similar to a given product (for product detail page)."""
        if not self.content_model.is_trained:
            return self._build_result(
                [(pid, 1.0) for pid in self.popular_products[:top_n]],
                reason="popular"
            )
        similar = self.content_model.get_similar_products(product_id, top_n=top_n)
        return self._build_result(similar, reason="content")

    def get_trending(self, top_n: int = 10) -> List[Dict]:
        """Get trending products for homepage."""
        products = self.trending_products[:top_n] or self.popular_products[:top_n]
        return self._build_result(
            [(pid, 1.0 - i * 0.05) for i, pid in enumerate(products)],
            reason="trending"
        )

    def _build_result(self, ranked: List[Tuple[str, float]], reason: str) -> List[Dict]:
        return [{"product_id": pid, "score": score, "reason_type": reason}
                for pid, score in ranked]

    def _save_models(self):
        try:
            self.collab_model.save(os.path.join(MODEL_DIR, "collab_model.pkl"))
            self.content_model.save(os.path.join(MODEL_DIR, "content_model.pkl"))
            logger.info("📦 Models saved to disk")
        except Exception as e:
            logger.error(f"Failed to save models: {e}")

    def load_models(self):
        try:
            collab_path = os.path.join(MODEL_DIR, "collab_model.pkl")
            content_path = os.path.join(MODEL_DIR, "content_model.pkl")
            if os.path.exists(collab_path):
                self.collab_model = CollaborativeFilteringModel.load(collab_path)
            if os.path.exists(content_path):
                self.content_model = ContentBasedModel.load(content_path)
            logger.info("📂 Models loaded from disk")
        except Exception as e:
            logger.warning(f"Could not load saved models: {e}")


# ── Singleton instance ───────────────────────────────────────
recommendation_engine = HybridRecommendationEngine()
recommendation_engine.load_models()
