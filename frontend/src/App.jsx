import React, { useState } from 'react'

const PRODUCTS = [
  {id:1,name:"NexoBook Pro 16",brand:"NexoTech",cat:"Electronics",price:2499.99,compare:2799.99,rating:4.8,reviews:312,img:"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80",desc:"Ultra-thin M3 Pro laptop, 16\" Retina XDR, 18hr battery"},
  {id:2,name:"QuantumTab Ultra",brand:"NexoTech",cat:"Electronics",price:1099.99,compare:1299.99,rating:4.6,reviews:198,img:"https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80",desc:"12.9\" OLED tablet with 5G connectivity"},
  {id:3,name:"NexoPhone X1",brand:"NexoTech",cat:"Electronics",price:999.99,rating:4.7,reviews:441,img:"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",desc:"200MP camera, 6.7\" Dynamic AMOLED 120Hz"},
  {id:4,name:"SoundOrb ANC Pro",brand:"SoundOrb",cat:"Audio",price:379.99,compare:449.99,rating:4.9,reviews:876,img:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",desc:"Industry-leading ANC headphones, 30hr battery"},
  {id:5,name:"BassCore Earbuds X",brand:"SoundOrb",cat:"Audio",price:249.99,rating:4.5,reviews:234,img:"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80",desc:"True wireless, spatial audio, 36hr total battery"},
  {id:6,name:"NexoWatch Ultra 2",brand:"NexoTech",cat:"Wearables",price:799.99,compare:899.99,rating:4.8,reviews:567,img:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",desc:"Titanium smartwatch, ECG, glucose, 60hr battery"},
  {id:7,name:"FitBand Pro X",brand:"FitTech",cat:"Wearables",price:199.99,rating:4.4,reviews:389,img:"https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&q=80",desc:"14-day battery, GPS, SpO2, 5ATM waterproof"},
  {id:8,name:"HyperX Nexus Controller",brand:"HyperX",cat:"Gaming",price:149.99,rating:4.6,reviews:1204,img:"https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&q=80",desc:"Pro controller, adaptive haptics, 40hr battery"},
  {id:9,name:"QuantumMouse Pro",brand:"HyperX",cat:"Gaming",price:89.99,rating:4.7,reviews:892,img:"https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&q=80",desc:"Ultra-light 61g, 25K DPI, 8000Hz polling"},
  {id:10,name:"NexoKeyboard TKL",brand:"HyperX",cat:"Gaming",price:179.99,compare:219.99,rating:4.5,reviews:654,img:"https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&q=80",desc:"TKL mechanical, hot-swap switches, per-key RGB"},
  {id:11,name:"LensMax A7V",brand:"LensMax",cat:"Photography",price:3299.99,rating:4.9,reviews:187,img:"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",desc:"61MP full-frame mirrorless, 4K 120fps, 8-stop IBIS"},
  {id:12,name:"DroneVision X4 Pro",brand:"AirView",cat:"Photography",price:1299.99,rating:4.6,reviews:321,img:"https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&q=80",desc:"4K/60fps aerial drone, 46min flight, 12km range"},
  {id:13,name:"NexoHub Smart Center",brand:"NexoHome",cat:"Smart Home",price:249.99,rating:4.5,reviews:432,img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",desc:"200+ devices, Zigbee/Z-Wave, AI routines"},
  {id:14,name:"AirPure Pro 5000",brand:"NexoHome",cat:"Smart Home",price:449.99,rating:4.7,reviews:298,img:"https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80",desc:"HEPA-H13, 500sqft coverage, PM2.5+VOC sensors"},
  {id:15,name:"StudioBar 900",brand:"SoundOrb",cat:"Audio",price:599.99,rating:4.7,reviews:143,img:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80",desc:"Dolby Atmos soundbar, wireless sub, 420W"},
  {id:16,name:"QuantumDisplay 27",brand:"NexoTech",cat:"Electronics",price:849.99,compare:999.99,rating:4.8,reviews:523,img:"https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80",desc:"27\" OLED 240Hz, 0.03ms response, 1440p"},
]

const s = {
  app:{minHeight:'100vh',background:'#07070c',color:'#eeeef8',fontFamily:'system-ui,sans-serif'},
  nav:{display:'flex',alignItems:'center',gap:'6px',padding:'0 20px',height:'58px',background:'rgba(7,7,12,0.96)',borderBottom:'1px solid rgba(255,255,255,0.08)',position:'sticky',top:0,zIndex:99,flexWrap:'wrap'},
  logo:{display:'flex',alignItems:'center',gap:'8px',fontWeight:'900',fontSize:'18px',letterSpacing:'-0.5px',cursor:'pointer',marginRight:'8px'},
  logoMark:{width:'32px',height:'32px',borderRadius:'8px',background:'linear-gradient(135deg,#6366f1,#22d3ee)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'900',color:'#fff',fontSize:'15px'},
  navBtn:{padding:'6px 12px',borderRadius:'7px',border:'none',background:'transparent',color:'rgba(238,238,248,0.5)',fontSize:'13px',fontWeight:'500',cursor:'pointer'},
  navBtnActive:{padding:'6px 12px',borderRadius:'7px',border:'none',background:'rgba(99,102,241,0.12)',color:'#818cf8',fontSize:'13px',fontWeight:'500',cursor:'pointer'},
  cartBtn:{position:'relative',padding:'8px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.09)',background:'rgba(255,255,255,0.05)',color:'rgba(238,238,248,0.6)',cursor:'pointer',marginLeft:'auto',display:'flex',alignItems:'center',justifyContent:'center'},
  cartDot:{position:'absolute',top:'-6px',right:'-6px',width:'17px',height:'17px',borderRadius:'50%',background:'#6366f1',color:'#fff',fontSize:'9px',fontWeight:'700',display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid #07070c'},
  page:{maxWidth:'1200px',margin:'0 auto',padding:'28px 20px'},
  hero:{textAlign:'center',padding:'52px 0 36px'},
  heroTitle:{fontSize:'clamp(30px,6vw,58px)',fontWeight:'900',letterSpacing:'-2px',lineHeight:'1.05',marginBottom:'16px'},
  grad:{background:'linear-gradient(135deg,#818cf8,#22d3ee,#f472b6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'},
  heroSub:{color:'rgba(238,238,248,0.45)',fontSize:'16px',maxWidth:'460px',margin:'0 auto 28px',fontWeight:'300',lineHeight:'1.7'},
  heroBtns:{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'},
  btnPri:{padding:'11px 24px',borderRadius:'9px',background:'#6366f1',color:'#fff',border:'none',fontSize:'14px',fontWeight:'600',cursor:'pointer',transition:'all .2s'},
  btnGhost:{padding:'11px 24px',borderRadius:'9px',background:'rgba(255,255,255,0.05)',color:'rgba(238,238,248,0.65)',border:'1px solid rgba(255,255,255,0.12)',fontSize:'14px',fontWeight:'500',cursor:'pointer'},
  heroStats:{display:'flex',justifyContent:'center',gap:'36px',marginTop:'44px',paddingTop:'28px',borderTop:'1px solid rgba(255,255,255,0.07)'},
  statN:{fontSize:'26px',fontWeight:'800',letterSpacing:'-0.5px'},
  statL:{fontSize:'11px',color:'rgba(238,238,248,0.28)',marginTop:'2px'},
  secHead:{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:'18px',marginTop:'44px'},
  secTitle:{fontSize:'19px',fontWeight:'700',letterSpacing:'-0.3px'},
  grid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:'16px'},
  card:{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',overflow:'hidden',cursor:'pointer',transition:'all 0.25s'},
  cardImg:{width:'100%',aspectRatio:'4/3',overflow:'hidden',background:'#14141f'},
  cardInfo:{padding:'14px'},
  cardBrand:{fontSize:'10px',color:'rgba(238,238,248,0.28)',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'4px'},
  cardName:{fontSize:'14px',fontWeight:'600',lineHeight:'1.3',marginBottom:'8px'},
  cardBottom:{display:'flex',alignItems:'center',justifyContent:'space-between'},
  cardPrice:{fontSize:'18px',fontWeight:'800'},
  addBtn:{width:'30px',height:'30px',borderRadius:'8px',background:'#6366f1',border:'none',color:'#fff',fontSize:'20px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  cats:{display:'flex',gap:'8px',overflowX:'auto',paddingBottom:'4px',marginTop:'24px'},
  cat:{padding:'7px 16px',borderRadius:'100px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.04)',fontSize:'12px',fontWeight:'500',cursor:'pointer',whiteSpace:'nowrap',color:'rgba(238,238,248,0.5)',transition:'all .2s'},
  catActive:{padding:'7px 16px',borderRadius:'100px',border:'1px solid #6366f1',background:'rgba(99,102,241,0.1)',fontSize:'12px',fontWeight:'500',cursor:'pointer',whiteSpace:'nowrap',color:'#818cf8'},
  aiBanner:{background:'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(34,211,238,0.06))',border:'1px solid rgba(99,102,241,0.22)',borderRadius:'16px',padding:'22px 24px',marginTop:'40px',display:'flex',alignItems:'center',gap:'16px',flexWrap:'wrap'},
  cartItem:{display:'flex',alignItems:'center',gap:'14px',padding:'16px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',marginBottom:'10px'},
  ciImg:{width:'68px',height:'68px',borderRadius:'10px',overflow:'hidden',background:'#14141f',flexShrink:0},
  summary:{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'22px',marginTop:'16px'},
  sumRow:{display:'flex',justifyContent:'space-between',fontSize:'13px',color:'rgba(238,238,248,0.5)',padding:'6px 0'},
  adminCard:{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'20px'},
  badge:{padding:'2px 8px',borderRadius:'100px',fontSize:'10px',fontWeight:'600'},
  divider:{height:'1px',background:'rgba(255,255,255,0.07)',margin:'36px 0'},
}

function Stars({r}){
  return(
    <span>
      {[1,2,3,4,5].map(i=>(
        <span key={i} style={{color:i<=Math.floor(r)?'#fbbf24':'rgba(255,255,255,0.15)',fontSize:'12px'}}>★</span>
      ))}
    </span>
  )
}

function Disc({p}){
  if(!p.compare) return null
  const d=Math.round((1-p.price/p.compare)*100)
  return <span style={{fontSize:'11px',color:'#34d399',marginLeft:'5px',fontWeight:'600'}}>-{d}%</span>
}

export default function App() {
  const [page, setPage] = useState('home')
  const [cart, setCart] = useState([])
  const [activeCat, setActiveCat] = useState(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('featured')
  const [orders, setOrders] = useState([
    {num:'NXR-192847',status:'Delivered',total:2499.99,date:'Mar 20, 2026',items:['NexoBook Pro 16']},
    {num:'NXR-184920',status:'Shipped',total:629.98,date:'Mar 22, 2026',items:['SoundOrb ANC Pro','FitBand Pro X']},
    {num:'NXR-176341',status:'Processing',total:799.99,date:'Mar 25, 2026',items:['NexoWatch Ultra 2']},
  ])

  const cartCount = cart.reduce((s,c)=>s+c.qty,0)

  function getFiltered(){
    let ps = activeCat ? PRODUCTS.filter(p=>p.cat===activeCat) : [...PRODUCTS]
    if(search) ps = ps.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||p.brand.toLowerCase().includes(search.toLowerCase()))
    if(sort==='price-asc') ps.sort((a,b)=>a.price-b.price)
    else if(sort==='price-desc') ps.sort((a,b)=>b.price-a.price)
    else if(sort==='rating') ps.sort((a,b)=>b.rating-a.rating)
    return ps
  }

  function addToCart(id,e){
    e && e.stopPropagation()
    setCart(prev=>{
      const ex=prev.find(c=>c.id===id)
      if(ex) return prev.map(c=>c.id===id?{...c,qty:c.qty+1}:c)
      return [...prev,{id,qty:1}]
    })
  }

  function removeFromCart(id){ setCart(prev=>prev.filter(c=>c.id!==id)) }

  function updateQty(id,d){
    setCart(prev=>{
      const updated=prev.map(c=>c.id===id?{...c,qty:Math.max(0,c.qty+d)}:c)
      return updated.filter(c=>c.qty>0)
    })
  }

  function checkout(){
    if(!cart.length) return
    const total=cart.reduce((s,c)=>{const p=PRODUCTS.find(x=>x.id===c.id);return s+(p?p.price*c.qty:0)},0)
    setOrders(prev=>[{
      num:'NXR-'+Math.floor(Math.random()*900000+100000),
      status:'Confirmed',total,
      date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),
      items:cart.map(c=>PRODUCTS.find(p=>p.id===c.id)?.name).filter(Boolean)
    },...prev])
    setCart([])
    setPage('orders')
  }

  function ProductCard({p, recTag}){
    return(
      <div
        style={s.card}
        onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.borderColor='rgba(255,255,255,0.18)'}}
        onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}}
      >
        <div style={s.cardImg}>
          <img
            src={p.img}
            alt={p.name}
            style={{width:'100%',height:'100%',objectFit:'cover',display:'block',transition:'transform .4s'}}
            onMouseEnter={e=>e.target.style.transform='scale(1.05)'}
            onMouseLeave={e=>e.target.style.transform='scale(1)'}
            onError={e=>e.target.style.display='none'}
          />
        </div>
        <div style={s.cardInfo}>
          {recTag && <div style={{fontSize:'10px',color:'#818cf8',fontWeight:'700',marginBottom:'5px',letterSpacing:'.3px'}}>{recTag}</div>}
          <div style={s.cardBrand}>{p.brand}</div>
          <div style={s.cardName}>{p.name}</div>
          <div style={{marginBottom:'10px',display:'flex',alignItems:'center',gap:'6px'}}>
            <Stars r={p.rating}/>
            <span style={{fontSize:'11px',color:'rgba(238,238,248,0.28)'}}>{p.rating} ({p.reviews.toLocaleString()})</span>
          </div>
          <div style={s.cardBottom}>
            <div>
              <span style={s.cardPrice}>${p.price.toFixed(2)}</span>
              {p.compare && <span style={{fontSize:'11px',color:'rgba(238,238,248,0.3)',textDecoration:'line-through',marginLeft:'5px'}}>${p.compare.toFixed(2)}</span>}
              <Disc p={p}/>
            </div>
            <button style={s.addBtn} onClick={(e)=>addToCart(p.id,e)}>+</button>
          </div>
        </div>
      </div>
    )
  }

  const navItems = [
    {id:'home',label:'Home'},
    {id:'shop',label:'Shop'},
    {id:'recommendations',label:'✨ For You'},
    {id:'orders',label:'Orders'},
    {id:'admin',label:'Admin'},
  ]

  const CATS = ['All','Electronics','Audio','Wearables','Gaming','Photography','Smart Home']

  return(
    <div style={s.app}>

      {/* ── NAV ── */}
      <nav style={s.nav}>
        <div style={s.logo} onClick={()=>setPage('home')}>
          <div style={s.logoMark}>N</div>
          NEXORA
        </div>
        {navItems.map(n=>(
          <button key={n.id} style={page===n.id?s.navBtnActive:s.navBtn} onClick={()=>setPage(n.id)}>
            {n.label}
          </button>
        ))}
        <button style={s.cartBtn} onClick={()=>setPage('cart')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          {cartCount>0 && <span style={s.cartDot}>{cartCount}</span>}
        </button>
      </nav>

      {/* ── HOME ── */}
      {page==='home' && (
        <div style={s.page}>
          <div style={s.hero}>
            <div style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'4px 14px',borderRadius:'100px',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.25)',color:'#818cf8',fontSize:'11px',fontWeight:'600',marginBottom:'22px'}}>
              <span style={{width:'5px',height:'5px',borderRadius:'50%',background:'#6366f1',display:'inline-block',animation:'pulse 2s infinite'}}></span>
              AI-Powered Shopping
            </div>
            <div style={s.heroTitle}>The Future of<br/><span style={s.grad}>Smart Commerce</span></div>
            <p style={s.heroSub}>Discover products tailored by our hybrid AI recommendation engine. Shop smarter, not harder.</p>
            <div style={s.heroBtns}>
              <button style={s.btnPri} onClick={()=>setPage('shop')}>🛒 Shop Now</button>
              <button style={s.btnGhost} onClick={()=>setPage('recommendations')}>✨ For You</button>
            </div>
            <div style={s.heroStats}>
              <div><div style={s.statN}>50K+</div><div style={s.statL}>Products</div></div>
              <div style={{width:'1px',background:'rgba(255,255,255,0.07)'}}></div>
              <div><div style={s.statN}>98%</div><div style={s.statL}>Satisfaction</div></div>
              <div style={{width:'1px',background:'rgba(255,255,255,0.07)'}}></div>
              <div><div style={s.statN}>2M+</div><div style={s.statL}>Users</div></div>
            </div>
          </div>

          <div style={s.cats}>
            {CATS.map(c=>(
              <div key={c} style={activeCat===(c==='All'?null:c)?s.catActive:s.cat} onClick={()=>setActiveCat(c==='All'?null:c)}>{c}</div>
            ))}
          </div>

          <div style={s.secHead}>
            <div>
              <div style={s.secTitle}>Featured Products</div>
              <div style={{fontSize:'12px',color:'rgba(238,238,248,0.3)',marginTop:'3px'}}>Handpicked for excellence</div>
            </div>
            <span style={{fontSize:'12px',color:'#818cf8',cursor:'pointer'}} onClick={()=>setPage('shop')}>View all →</span>
          </div>
          <div style={s.grid}>
            {PRODUCTS.filter(p=>p.rating>=4.8 && (!activeCat||p.cat===activeCat)).slice(0,4).map(p=><ProductCard key={p.id} p={p}/>)}
          </div>

          <div style={s.aiBanner}>
            <span style={{fontSize:'36px'}}>🤖</span>
            <div style={{flex:1}}>
              <div style={{fontSize:'17px',fontWeight:'700',marginBottom:'5px'}}>Your AI Shopping Assistant</div>
              <div style={{fontSize:'13px',color:'rgba(238,238,248,0.45)',fontWeight:'300'}}>Hybrid collaborative + content-based model learns your preferences in real time.</div>
            </div>
            <button style={s.btnPri} onClick={()=>setPage('recommendations')}>See Recommendations</button>
          </div>

          <div style={s.secHead}>
            <div style={s.secTitle}>🔥 Trending Now</div>
          </div>
          <div style={s.grid}>
            {[...PRODUCTS].sort(()=>.5-Math.random()).slice(0,4).map(p=><ProductCard key={p.id} p={p} recTag="🔥 Trending"/>)}
          </div>
          <div style={{height:'40px'}}></div>
        </div>
      )}

      {/* ── SHOP ── */}
      {page==='shop' && (
        <div style={s.page}>
          <div style={{...s.secTitle,marginBottom:'20px'}}>Shop All Products</div>

          <div style={{display:'flex',gap:'10px',marginBottom:'16px',flexWrap:'wrap',alignItems:'center'}}>
            <div style={{display:'flex',alignItems:'center',gap:'8px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'9px 14px',flex:1,minWidth:'200px'}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(238,238,248,0.3)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products, brands…" style={{background:'none',border:'none',outline:'none',color:'#eeeef8',fontSize:'14px',fontFamily:'inherit',flex:1}}/>
            </div>
            <select value={sort} onChange={e=>setSort(e.target.value)} style={{padding:'9px 12px',borderRadius:'9px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:'#eeeef8',fontSize:'13px',cursor:'pointer'}}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          <div style={s.cats}>
            {CATS.map(c=>(
              <div key={c} style={activeCat===(c==='All'?null:c)?s.catActive:s.cat} onClick={()=>setActiveCat(c==='All'?null:c)}>{c}</div>
            ))}
          </div>

          <div style={{fontSize:'12px',color:'rgba(238,238,248,0.3)',margin:'16px 0'}}>{getFiltered().length} products</div>
          <div style={s.grid}>{getFiltered().map(p=><ProductCard key={p.id} p={p}/>)}</div>
          <div style={{height:'40px'}}></div>
        </div>
      )}

      {/* ── RECOMMENDATIONS ── */}
      {page==='recommendations' && (
        <div style={s.page}>
          <div style={s.aiBanner}>
            <span style={{fontSize:'36px'}}>✨</span>
            <div>
              <div style={{fontSize:'17px',fontWeight:'700',marginBottom:'5px'}}>Personalized For You</div>
              <div style={{fontSize:'13px',color:'rgba(238,238,248,0.45)',fontWeight:'300'}}>
                Hybrid model: 60% collaborative filtering + 40% content-based. Refreshed every 6 hours.
              </div>
              <div style={{display:'flex',gap:'8px',marginTop:'10px'}}>
                <span style={{...s.badge,background:'rgba(99,102,241,0.15)',color:'#818cf8',border:'1px solid rgba(99,102,241,0.3)',padding:'3px 10px'}}>Hybrid Model</span>
                <span style={{...s.badge,background:'rgba(34,211,238,0.1)',color:'#22d3ee',border:'1px solid rgba(34,211,238,0.2)',padding:'3px 10px'}}>Collaborative + Content</span>
              </div>
            </div>
          </div>

          <div style={s.secHead}><div style={s.secTitle}>Recommended For You</div></div>
          <div style={s.grid}>
            {PRODUCTS.filter(p=>[4,6,1,7,8,13].includes(p.id)).map((p,i)=>{
              const tags=['✦ Hybrid AI','✦ Your History','✦ Content Match','🔥 Trending','✦ Collaborative','✦ Similar Pick']
              return <ProductCard key={p.id} p={p} recTag={tags[i]}/>
            })}
          </div>

          <div style={s.divider}></div>
          <div style={s.secHead}><div style={s.secTitle}>🔥 Trending Now</div></div>
          <div style={s.grid}>
            {PRODUCTS.filter(p=>[3,5,9,10,14,16].includes(p.id)).map(p=><ProductCard key={p.id} p={p} recTag="🔥 Trending"/>)}
          </div>
          <div style={{height:'40px'}}></div>
        </div>
      )}

      {/* ── CART ── */}
      {page==='cart' && (
        <div style={s.page}>
          <div style={{...s.secTitle,marginBottom:'20px'}}>Your Cart</div>
          {cart.length===0 ? (
            <div style={{textAlign:'center',padding:'70px 20px',color:'rgba(238,238,248,0.3)'}}>
              <div style={{fontSize:'52px',marginBottom:'14px'}}>🛒</div>
              <div style={{fontSize:'20px',fontWeight:'700',color:'rgba(238,238,248,0.5)',marginBottom:'8px'}}>Cart is empty</div>
              <div style={{marginBottom:'24px',fontSize:'14px'}}>Start shopping to fill it up!</div>
              <button style={s.btnPri} onClick={()=>setPage('shop')}>Browse Products</button>
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'1fr',gap:'0'}}>
              {cart.map(c=>{
                const p=PRODUCTS.find(x=>x.id===c.id)
                if(!p) return null
                return(
                  <div key={c.id} style={s.cartItem}>
                    <div style={s.ciImg}>
                      <img src={p.img} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:'11px',color:'rgba(238,238,248,0.28)',marginBottom:'2px'}}>{p.brand}</div>
                      <div style={{fontWeight:'600',fontSize:'14px',marginBottom:'4px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
                      <div style={{color:'#818cf8',fontWeight:'700',fontSize:'15px'}}>${p.price.toFixed(2)}</div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'10px',flexShrink:0}}>
                      <div style={{display:'flex',alignItems:'center',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'8px',overflow:'hidden'}}>
                        <button onClick={()=>updateQty(c.id,-1)} style={{padding:'6px 12px',background:'none',border:'none',color:'#eeeef8',cursor:'pointer',fontSize:'16px'}}>−</button>
                        <span style={{padding:'6px 12px',fontWeight:'700'}}>{c.qty}</span>
                        <button onClick={()=>updateQty(c.id,1)} style={{padding:'6px 12px',background:'none',border:'none',color:'#eeeef8',cursor:'pointer',fontSize:'16px'}}>+</button>
                      </div>
                      <span style={{fontWeight:'800',fontSize:'15px',minWidth:'72px',textAlign:'right'}}>${(p.price*c.qty).toFixed(2)}</span>
                      <button onClick={()=>removeFromCart(c.id)} style={{background:'none',border:'none',color:'#f87171',cursor:'pointer',fontSize:'20px',padding:'4px'}}>✕</button>
                    </div>
                  </div>
                )
              })}
              {(()=>{
                const sub=cart.reduce((s,c)=>{const p=PRODUCTS.find(x=>x.id===c.id);return s+(p?p.price*c.qty:0)},0)
                const tax=sub*0.08
                return(
                  <div style={s.summary}>
                    <div style={{fontSize:'16px',fontWeight:'700',marginBottom:'16px'}}>Order Summary</div>
                    <div style={s.sumRow}><span>Subtotal</span><span>${sub.toFixed(2)}</span></div>
                    <div style={s.sumRow}><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                    <div style={s.sumRow}><span>Shipping</span><span style={{color:'#34d399'}}>Free</span></div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'18px',fontWeight:'800',padding:'14px 0 0',marginTop:'8px',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
                      <span>Total</span><span>${(sub+tax).toFixed(2)}</span>
                    </div>
                    <button style={{...s.btnPri,width:'100%',marginTop:'16px',padding:'14px',fontSize:'15px'}} onClick={checkout}>
                      Proceed to Checkout →
                    </button>
                    <button style={{...s.btnGhost,width:'100%',marginTop:'10px',padding:'12px'}} onClick={()=>setPage('shop')}>
                      Continue Shopping
                    </button>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      )}

      {/* ── ORDERS ── */}
      {page==='orders' && (
        <div style={s.page}>
          <div style={{...s.secTitle,marginBottom:'20px'}}>Order History</div>
          {orders.length===0 ? (
            <div style={{textAlign:'center',padding:'60px',color:'rgba(238,238,248,0.3)'}}>
              <div style={{fontSize:'48px',marginBottom:'12px'}}>📦</div>
              <div style={{fontSize:'18px',fontWeight:'700',color:'rgba(238,238,248,0.5)'}}>No orders yet</div>
            </div>
          ) : orders.map((o,i)=>{
            const sc={Delivered:{bg:'rgba(52,211,153,0.12)',c:'#34d399'},Shipped:{bg:'rgba(99,102,241,0.12)',c:'#818cf8'},Processing:{bg:'rgba(251,191,36,0.1)',c:'#fbbf24'},Confirmed:{bg:'rgba(34,211,238,0.1)',c:'#22d3ee'},Cancelled:{bg:'rgba(248,113,113,0.1)',c:'#f87171'}}
            const st=sc[o.status]||sc.Confirmed
            return(
              <div key={i} style={{...s.adminCard,marginBottom:'12px'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'10px',marginBottom:'12px'}}>
                  <div>
                    <div style={{fontWeight:'700',fontSize:'15px'}}>{o.num}</div>
                    <div style={{fontSize:'11px',color:'rgba(238,238,248,0.28)',marginTop:'2px'}}>{o.date}</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                    <span style={{...s.badge,background:st.bg,color:st.c,padding:'4px 12px',fontSize:'11px'}}>{o.status}</span>
                    <span style={{fontWeight:'800',fontSize:'18px'}}>${o.total.toFixed(2)}</span>
                  </div>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'12px'}}>
                  {o.items.map((item,j)=>(
                    <span key={j} style={{fontSize:'12px',background:'rgba(255,255,255,0.05)',padding:'3px 10px',borderRadius:'6px',color:'rgba(238,238,248,0.5)'}}>{item}</span>
                  ))}
                </div>
                <div style={{display:'flex',gap:'8px'}}>
                  <button style={{...s.btnGhost,fontSize:'12px',padding:'6px 14px'}} onClick={()=>alert(`Tracking ${o.num}: On its way! 🚚`)}>Track Order</button>
                  <button style={{...s.btnGhost,fontSize:'12px',padding:'6px 14px'}}>Reorder</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── ADMIN ── */}
      {page==='admin' && (
        <div style={s.page}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'28px',flexWrap:'wrap',gap:'12px'}}>
            <div>
              <div style={{fontSize:'26px',fontWeight:'900',letterSpacing:'-1px'}}>Admin Dashboard</div>
              <div style={{fontSize:'13px',color:'rgba(238,238,248,0.3)',marginTop:'4px'}}>Real-time analytics & management</div>
            </div>
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              <span style={{...s.badge,background:'rgba(52,211,153,0.1)',color:'#34d399',padding:'5px 12px',fontSize:'12px'}}>● Live</span>
              <button style={{...s.btnGhost,fontSize:'13px',padding:'7px 16px'}} onClick={()=>alert('🤖 ML model retraining triggered!\n\nCheck logs for progress.')}>Retrain AI Model</button>
              <button style={{...s.btnPri,fontSize:'13px',padding:'7px 16px'}} onClick={()=>alert('📝 Add product form')}>+ Add Product</button>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'14px',marginBottom:'24px'}}>
            {[
              {icon:'💰',label:'Total Revenue',val:'$847K',sub:'↑ 12.4% this month',subc:'#34d399'},
              {icon:'📦',label:'Total Orders',val:'12,847',sub:'↑ 8.2% this month',subc:'#34d399'},
              {icon:'👥',label:'Total Users',val:'24,591',sub:'↑ 23.1% this month',subc:'#34d399'},
              {icon:'🛍️',label:'Products',val:'1,284',sub:'18 low stock',subc:'#fbbf24'},
            ].map(c=>(
              <div key={c.label} style={s.adminCard}>
                <div style={{fontSize:'26px',marginBottom:'12px'}}>{c.icon}</div>
                <div style={{fontSize:'10px',color:'rgba(238,238,248,0.28)',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'4px'}}>{c.label}</div>
                <div style={{fontSize:'28px',fontWeight:'900',letterSpacing:'-1px'}}>{c.val}</div>
                <div style={{fontSize:'11px',color:c.subc,marginTop:'5px'}}>{c.sub}</div>
              </div>
            ))}
          </div>

          <div style={{...s.adminCard,marginBottom:'16px'}}>
            <div style={{fontWeight:'700',fontSize:'16px',marginBottom:'20px'}}>🤖 AI Recommendation Engine — Performance</div>
            {[
              {label:'Click-Through Rate',val:'18.4%',fill:18.4,color:'#818cf8'},
              {label:'Conversion Uplift',val:'+62%',fill:62,color:'#34d399'},
              {label:'Model Accuracy (RMSE)',val:'84.7%',fill:84.7,color:'#22d3ee'},
              {label:'Interactions Tracked',val:'2.4M',fill:78,color:'#fbbf24'},
            ].map(m=>(
              <div key={m.label} style={{marginBottom:'18px'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',marginBottom:'7px'}}>
                  <span style={{color:'rgba(238,238,248,0.5)'}}>{m.label}</span>
                  <span style={{fontWeight:'700',color:m.color}}>{m.val}</span>
                </div>
                <div style={{height:'5px',background:'rgba(255,255,255,0.06)',borderRadius:'5px',overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${m.fill}%`,background:m.color,borderRadius:'5px',transition:'width 1s ease'}}></div>
                </div>
              </div>
            ))}
          </div>

          <div style={s.adminCard}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'18px',flexWrap:'wrap',gap:'10px'}}>
              <div style={{fontWeight:'700',fontSize:'16px'}}>Products Management</div>
              <div style={{fontSize:'12px',color:'rgba(238,238,248,0.3)'}}>{PRODUCTS.length} total products</div>
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
                <thead>
                  <tr>
                    {['Product','Category','Price','Rating','Stock','Status','Actions'].map(h=>(
                      <th key={h} style={{padding:'10px 12px',textAlign:'left',fontSize:'10px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.5px',color:'rgba(238,238,248,0.28)',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PRODUCTS.map(p=>(
                    <tr key={p.id} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                      <td style={{padding:'12px',borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                          <div style={{width:'36px',height:'36px',borderRadius:'8px',overflow:'hidden',flexShrink:0}}>
                            <img src={p.img} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                          </div>
                          <span style={{fontWeight:'600'}}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{padding:'12px',borderBottom:'1px solid rgba(255,255,255,0.03)'}}><span style={{...s.badge,background:'rgba(34,211,238,0.08)',color:'#22d3ee',padding:'3px 10px'}}>{p.cat}</span></td>
                      <td style={{padding:'12px',fontWeight:'700',borderBottom:'1px solid rgba(255,255,255,0.03)'}}>${p.price.toFixed(2)}</td>
                      <td style={{padding:'12px',color:'#fbbf24',borderBottom:'1px solid rgba(255,255,255,0.03)'}}>★ {p.rating}</td>
                      <td style={{padding:'12px',borderBottom:'1px solid rgba(255,255,255,0.03)'}}><span style={{...s.badge,background:'rgba(52,211,153,0.08)',color:'#34d399',padding:'3px 10px'}}>In Stock</span></td>
                      <td style={{padding:'12px',borderBottom:'1px solid rgba(255,255,255,0.03)'}}><span style={{...s.badge,background:'rgba(99,102,241,0.1)',color:'#818cf8',padding:'3px 10px'}}>Active</span></td>
                      <td style={{padding:'12px',borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
                        <button style={{background:'none',border:'none',color:'#818cf8',cursor:'pointer',fontSize:'12px',padding:'3px 8px',borderRadius:'5px'}} onClick={()=>alert(`Edit: ${p.name}`)}>Edit</button>
                        <button style={{background:'none',border:'none',color:'#f87171',cursor:'pointer',fontSize:'12px',padding:'3px 8px',borderRadius:'5px'}}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{height:'40px'}}></div>
        </div>
      )}
    </div>
  )
}
