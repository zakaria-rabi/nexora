import React, { useState } from 'react'

const PRODUCTS = [
  {id:1,name:"NexoBook Pro 16",brand:"NexoTech",cat:"Electronics",price:2499.99,compare:2799.99,rating:4.8,reviews:312,icon:"💻",desc:"Ultra-thin M3 Pro laptop, 16\" Retina, 18hr battery"},
  {id:2,name:"QuantumTab Ultra",brand:"NexoTech",cat:"Electronics",price:1099.99,compare:1299.99,rating:4.6,reviews:198,icon:"📱",desc:"12.9\" OLED tablet with 5G"},
  {id:3,name:"NexoPhone X1",brand:"NexoTech",cat:"Electronics",price:999.99,rating:4.7,reviews:441,icon:"📲",desc:"200MP camera, 6.7\" AMOLED 120Hz"},
  {id:4,name:"SoundOrb ANC Pro",brand:"SoundOrb",cat:"Audio",price:379.99,compare:449.99,rating:4.9,reviews:876,icon:"🎧",desc:"Best ANC headphones, 30hr battery"},
  {id:5,name:"NexoWatch Ultra 2",brand:"NexoTech",cat:"Wearables",price:799.99,compare:899.99,rating:4.8,reviews:567,icon:"⌚",desc:"Titanium smartwatch, ECG, 60hr"},
  {id:6,name:"HyperX Controller",brand:"HyperX",cat:"Gaming",price:149.99,rating:4.6,reviews:1204,icon:"🎮",desc:"Pro controller, haptics, 40hr"},
  {id:7,name:"LensMax A7V",brand:"LensMax",cat:"Photography",price:3299.99,rating:4.9,reviews:187,icon:"📷",desc:"61MP mirrorless, 4K 120fps"},
  {id:8,name:"NexoHub Smart",brand:"NexoHome",cat:"Smart Home",price:249.99,rating:4.5,reviews:432,icon:"🏠",desc:"200+ devices, AI routines"},
]

const s = {
  app:{minHeight:'100vh',background:'#07070c',color:'#eeeef8',fontFamily:'system-ui,sans-serif'},
  nav:{display:'flex',alignItems:'center',gap:'8px',padding:'0 20px',height:'56px',background:'rgba(7,7,12,0.95)',borderBottom:'1px solid rgba(255,255,255,0.08)',position:'sticky',top:0,zIndex:99},
  logo:{display:'flex',alignItems:'center',gap:'8px',fontWeight:'900',fontSize:'18px',letterSpacing:'-0.5px',cursor:'pointer'},
  logoMark:{width:'30px',height:'30px',borderRadius:'8px',background:'linear-gradient(135deg,#6366f1,#22d3ee)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'900',color:'#fff',fontSize:'14px'},
  navBtn:{padding:'6px 14px',borderRadius:'7px',border:'none',background:'transparent',color:'rgba(238,238,248,0.55)',fontSize:'13px',fontWeight:'500',cursor:'pointer'},
  navBtnActive:{padding:'6px 14px',borderRadius:'7px',border:'none',background:'rgba(99,102,241,0.12)',color:'#818cf8',fontSize:'13px',fontWeight:'500',cursor:'pointer'},
  cartBtn:{position:'relative',padding:'7px',borderRadius:'7px',border:'1px solid rgba(255,255,255,0.09)',background:'rgba(255,255,255,0.05)',color:'rgba(238,238,248,0.55)',cursor:'pointer',marginLeft:'auto',display:'flex'},
  cartDot:{position:'absolute',top:'-5px',right:'-5px',width:'16px',height:'16px',borderRadius:'50%',background:'#6366f1',color:'#fff',fontSize:'9px',fontWeight:'700',display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid #07070c'},
  page:{maxWidth:'1200px',margin:'0 auto',padding:'24px 20px'},
  hero:{textAlign:'center',padding:'48px 0 32px'},
  heroTitle:{fontSize:'clamp(32px,6vw,60px)',fontWeight:'900',letterSpacing:'-2px',lineHeight:'1.05',marginBottom:'16px'},
  grad:{background:'linear-gradient(135deg,#818cf8,#22d3ee,#f472b6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'},
  heroSub:{color:'rgba(238,238,248,0.5)',fontSize:'16px',maxWidth:'440px',margin:'0 auto 28px',fontWeight:'300'},
  heroBtns:{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap'},
  btnPri:{padding:'11px 24px',borderRadius:'9px',background:'#6366f1',color:'#fff',border:'none',fontSize:'14px',fontWeight:'600',cursor:'pointer'},
  btnGhost:{padding:'11px 24px',borderRadius:'9px',background:'rgba(255,255,255,0.05)',color:'rgba(238,238,248,0.7)',border:'1px solid rgba(255,255,255,0.12)',fontSize:'14px',fontWeight:'500',cursor:'pointer'},
  heroStats:{display:'flex',justifyContent:'center',gap:'32px',marginTop:'40px',paddingTop:'28px',borderTop:'1px solid rgba(255,255,255,0.08)'},
  statN:{fontSize:'24px',fontWeight:'800',letterSpacing:'-0.5px'},
  statL:{fontSize:'11px',color:'rgba(238,238,248,0.3)',marginTop:'2px'},
  secHead:{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:'16px',marginTop:'40px'},
  secTitle:{fontSize:'18px',fontWeight:'700',letterSpacing:'-0.3px'},
  grid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'16px'},
  card:{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',overflow:'hidden',cursor:'pointer',transition:'all 0.25s'},
  cardImg:{width:'100%',aspectRatio:'4/3',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'52px',background:'#14141f'},
  cardInfo:{padding:'14px'},
  cardBrand:{fontSize:'10px',color:'rgba(238,238,248,0.3)',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'4px'},
  cardName:{fontSize:'14px',fontWeight:'600',lineHeight:'1.3',marginBottom:'8px'},
  cardBottom:{display:'flex',alignItems:'center',justifyContent:'space-between'},
  cardPrice:{fontSize:'18px',fontWeight:'800'},
  cardCompare:{fontSize:'11px',color:'rgba(238,238,248,0.3)',textDecoration:'line-through',marginLeft:'5px'},
  addBtn:{width:'30px',height:'30px',borderRadius:'8px',background:'#6366f1',border:'none',color:'#fff',fontSize:'18px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'},
  cats:{display:'flex',gap:'8px',overflowX:'auto',paddingBottom:'4px',marginTop:'24px'},
  cat:{padding:'7px 16px',borderRadius:'100px',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.04)',fontSize:'12px',fontWeight:'500',cursor:'pointer',whiteSpace:'nowrap',color:'rgba(238,238,248,0.55)'},
  catActive:{padding:'7px 16px',borderRadius:'100px',border:'1px solid #6366f1',background:'rgba(99,102,241,0.1)',fontSize:'12px',fontWeight:'500',cursor:'pointer',whiteSpace:'nowrap',color:'#818cf8'},
  aiBanner:{background:'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(34,211,238,0.07))',border:'1px solid rgba(99,102,241,0.25)',borderRadius:'16px',padding:'20px 24px',marginTop:'40px',display:'flex',alignItems:'center',gap:'16px'},
  cartItem:{display:'flex',alignItems:'center',gap:'12px',padding:'16px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',marginBottom:'10px'},
  ciImg:{width:'64px',height:'64px',borderRadius:'10px',background:'#14141f',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px',flexShrink:0},
  summary:{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'20px',marginTop:'16px'},
  sumRow:{display:'flex',justifyContent:'space-between',fontSize:'13px',color:'rgba(238,238,248,0.55)',padding:'6px 0'},
  sumTotal:{display:'flex',justifyContent:'space-between',fontSize:'16px',fontWeight:'700',padding:'14px 0 0',marginTop:'8px',borderTop:'1px solid rgba(255,255,255,0.08)'},
  adminCard:{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'20px'},
  badge:{padding:'2px 8px',borderRadius:'100px',fontSize:'10px',fontWeight:'600'},
}

function Stars({r}){return <span style={{color:'#fbbf24',fontSize:'12px'}}>{'★'.repeat(Math.floor(r))}{'☆'.repeat(5-Math.floor(r))}</span>}

export default function App() {
  const [page, setPage] = useState('home')
  const [cart, setCart] = useState([])
  const [activeCat, setActiveCat] = useState(null)
  const [orders, setOrders] = useState([
    {num:'NXR-192847',status:'Delivered',total:2499.99,date:'Mar 20, 2026',items:['NexoBook Pro 16']},
    {num:'NXR-184920',status:'Shipped',total:629.98,date:'Mar 22, 2026',items:['SoundOrb ANC Pro']},
  ])

  const cartCount = cart.reduce((s,c)=>s+c.qty,0)
  const filtered = activeCat ? PRODUCTS.filter(p=>p.cat===activeCat) : PRODUCTS

  function addToCart(id){
    setCart(prev=>{
      const e=prev.find(c=>c.id===id)
      if(e) return prev.map(c=>c.id===id?{...c,qty:c.qty+1}:c)
      return [...prev,{id,qty:1}]
    })
  }

  function removeFromCart(id){setCart(prev=>prev.filter(c=>c.id!==id))}

  function checkout(){
    if(!cart.length) return
    const total=cart.reduce((s,c)=>{const p=PRODUCTS.find(x=>x.id===c.id);return s+(p?p.price*c.qty:0)},0)
    setOrders(prev=>[{num:'NXR-'+Math.floor(Math.random()*900000+100000),status:'Confirmed',total,date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),items:cart.map(c=>PRODUCTS.find(p=>p.id===c.id)?.name).filter(Boolean)},...prev])
    setCart([])
    setPage('orders')
  }

  function ProductCard({p}){
    const disc=p.compare?Math.round((1-p.price/p.compare)*100):null
    return(
      <div style={s.card} onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.borderColor='rgba(255,255,255,0.16)'}} onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}}>
        <div style={s.cardImg}>{p.icon}</div>
        <div style={s.cardInfo}>
          <div style={s.cardBrand}>{p.brand}</div>
          <div style={s.cardName}>{p.name}</div>
          <div style={{marginBottom:'8px'}}><Stars r={p.rating}/> <span style={{fontSize:'11px',color:'rgba(238,238,248,0.3)'}}>{p.rating} ({p.reviews})</span></div>
          <div style={s.cardBottom}>
            <div>
              <span style={s.cardPrice}>${p.price.toFixed(2)}</span>
              {p.compare&&<span style={s.cardCompare}>${p.compare.toFixed(2)}</span>}
              {disc&&<span style={{fontSize:'11px',color:'#34d399',marginLeft:'4px'}}>-{disc}%</span>}
            </div>
            <button style={s.addBtn} onClick={()=>addToCart(p.id)}>+</button>
          </div>
        </div>
      </div>
    )
  }

  return(
    <div style={s.app}>
      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.logo} onClick={()=>setPage('home')}>
          <div style={s.logoMark}>N</div>
          NEXORA
        </div>
        {['home','shop','recommendations','orders','admin'].map(p=>(
          <button key={p} style={page===p?s.navBtnActive:s.navBtn} onClick={()=>setPage(p)}>
            {p==='home'?'Home':p==='shop'?'Shop':p==='recommendations'?'✨ For You':p==='orders'?'Orders':'Admin'}
          </button>
        ))}
        <button style={s.cartBtn} onClick={()=>setPage('cart')}>
          🛍️
          {cartCount>0&&<span style={s.cartDot}>{cartCount}</span>}
        </button>
      </nav>

      {/* HOME */}
      {page==='home'&&(
        <div style={s.page}>
          <div style={s.hero}>
            <div style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'4px 12px',borderRadius:'100px',background:'rgba(99,102,241,0.12)',border:'1px solid rgba(99,102,241,0.25)',color:'#818cf8',fontSize:'11px',fontWeight:'600',marginBottom:'20px'}}>
              <span style={{width:'5px',height:'5px',borderRadius:'50%',background:'#6366f1',display:'inline-block'}}></span>
              AI-Powered Shopping
            </div>
            <div style={s.heroTitle}>The Future of<br/><span style={s.grad}>Smart Commerce</span></div>
            <p style={s.heroSub}>Discover products tailored by our hybrid AI recommendation engine.</p>
            <div style={s.heroBtns}>
              <button style={s.btnPri} onClick={()=>setPage('shop')}>Shop Now</button>
              <button style={s.btnGhost} onClick={()=>setPage('recommendations')}>✨ For You</button>
            </div>
            <div style={s.heroStats}>
              <div><div style={s.statN}>50K+</div><div style={s.statL}>Products</div></div>
              <div style={{width:'1px',background:'rgba(255,255,255,0.08)'}}></div>
              <div><div style={s.statN}>98%</div><div style={s.statL}>Satisfaction</div></div>
              <div style={{width:'1px',background:'rgba(255,255,255,0.08)'}}></div>
              <div><div style={s.statN}>2M+</div><div style={s.statL}>Users</div></div>
            </div>
          </div>
          <div style={s.cats}>
            {['All','Electronics','Audio','Wearables','Gaming','Photography','Smart Home'].map(c=>(
              <div key={c} style={activeCat===(c==='All'?null:c)?s.catActive:s.cat} onClick={()=>setActiveCat(c==='All'?null:c)}>{c}</div>
            ))}
          </div>
          <div style={s.secHead}><div style={s.secTitle}>Featured Products</div><span style={{fontSize:'12px',color:'#818cf8',cursor:'pointer'}} onClick={()=>setPage('shop')}>View all →</span></div>
          <div style={s.grid}>{filtered.filter(p=>p.rating>=4.8).slice(0,4).map(p=><ProductCard key={p.id} p={p}/>)}</div>
          <div style={s.aiBanner}>
            <span style={{fontSize:'32px'}}>🤖</span>
            <div style={{flex:1}}>
              <div style={{fontSize:'16px',fontWeight:'700',marginBottom:'4px'}}>Your AI Shopping Assistant</div>
              <div style={{fontSize:'13px',color:'rgba(238,238,248,0.5)'}}>Hybrid collaborative + content-based model learns your preferences in real time.</div>
            </div>
            <button style={s.btnPri} onClick={()=>setPage('recommendations')}>See Recs</button>
          </div>
          <div style={s.secHead}><div style={s.secTitle}>🔥 Trending Now</div></div>
          <div style={s.grid}>{[...PRODUCTS].sort(()=>.5-Math.random()).slice(0,4).map(p=><ProductCard key={p.id} p={p}/>)}</div>
        </div>
      )}

      {/* SHOP */}
      {page==='shop'&&(
        <div style={s.page}>
          <div style={s.secTitle}>Shop All Products</div>
          <div style={s.cats}>
            {['All','Electronics','Audio','Wearables','Gaming','Photography','Smart Home'].map(c=>(
              <div key={c} style={activeCat===(c==='All'?null:c)?s.catActive:s.cat} onClick={()=>setActiveCat(c==='All'?null:c)}>{c}</div>
            ))}
          </div>
          <div style={{...s.secHead,marginTop:'20px'}}><div style={{fontSize:'13px',color:'rgba(238,238,248,0.3)'}}>{filtered.length} products</div></div>
          <div style={s.grid}>{filtered.map(p=><ProductCard key={p.id} p={p}/>)}</div>
        </div>
      )}

      {/* RECOMMENDATIONS */}
      {page==='recommendations'&&(
        <div style={s.page}>
          <div style={s.aiBanner}>
            <span style={{fontSize:'32px'}}>✨</span>
            <div>
              <div style={{fontSize:'16px',fontWeight:'700',marginBottom:'4px'}}>Personalized For You</div>
              <div style={{fontSize:'13px',color:'rgba(238,238,248,0.5)'}}>Hybrid model: 60% collaborative + 40% content-based filtering.</div>
            </div>
          </div>
          <div style={s.secHead}><div style={s.secTitle}>Recommended For You</div></div>
          <div style={s.grid}>{PRODUCTS.filter(p=>[4,5,1,7,6,8].includes(p.id)).map(p=>(
            <div key={p.id}>
              <div style={{color:'#818cf8',fontSize:'10px',fontWeight:'700',marginBottom:'4px'}}>✦ Hybrid AI</div>
              <ProductCard p={p}/>
            </div>
          ))}</div>
          <div style={{...s.secHead,marginTop:'40px'}}><div style={s.secTitle}>🔥 Trending</div></div>
          <div style={s.grid}>{PRODUCTS.slice(0,4).map(p=><ProductCard key={p.id} p={p}/>)}</div>
        </div>
      )}

      {/* CART */}
      {page==='cart'&&(
        <div style={s.page}>
          <div style={s.secTitle}>Your Cart</div>
          {cart.length===0?(
            <div style={{textAlign:'center',padding:'60px 20px',color:'rgba(238,238,248,0.3)'}}>
              <div style={{fontSize:'48px',marginBottom:'12px'}}>🛒</div>
              <div style={{fontSize:'18px',fontWeight:'700',color:'rgba(238,238,248,0.5)',marginBottom:'8px'}}>Cart is empty</div>
              <button style={{...s.btnPri,marginTop:'16px'}} onClick={()=>setPage('shop')}>Browse Products</button>
            </div>
          ):(
            <>
              {cart.map(c=>{
                const p=PRODUCTS.find(x=>x.id===c.id)
                if(!p) return null
                return(
                  <div key={c.id} style={s.cartItem}>
                    <div style={s.ciImg}>{p.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'11px',color:'rgba(238,238,248,0.3)',marginBottom:'2px'}}>{p.brand}</div>
                      <div style={{fontWeight:'600',marginBottom:'4px'}}>{p.name}</div>
                      <div style={{color:'#818cf8',fontWeight:'700'}}>${p.price.toFixed(2)}</div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      <span style={{fontWeight:'700'}}>×{c.qty}</span>
                      <span style={{fontWeight:'800',minWidth:'70px',textAlign:'right'}}>${(p.price*c.qty).toFixed(2)}</span>
                      <button onClick={()=>removeFromCart(c.id)} style={{background:'none',border:'none',color:'#f87171',cursor:'pointer',fontSize:'18px'}}>✕</button>
                    </div>
                  </div>
                )
              })}
              <div style={s.summary}>
                {(()=>{
                  const sub=cart.reduce((s,c)=>{const p=PRODUCTS.find(x=>x.id===c.id);return s+(p?p.price*c.qty:0)},0)
                  const tax=sub*0.08
                  return(<>
                    <div style={s.sumRow}><span>Subtotal</span><span>${sub.toFixed(2)}</span></div>
                    <div style={s.sumRow}><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                    <div style={s.sumRow}><span>Shipping</span><span style={{color:'#34d399'}}>Free</span></div>
                    <div style={s.sumTotal}><span>Total</span><span>${(sub+tax).toFixed(2)}</span></div>
                    <button style={{...s.btnPri,width:'100%',marginTop:'16px',padding:'14px',fontSize:'15px'}} onClick={checkout}>Proceed to Checkout →</button>
                  </>)
                })()}
              </div>
            </>
          )}
        </div>
      )}

      {/* ORDERS */}
      {page==='orders'&&(
        <div style={s.page}>
          <div style={s.secTitle}>Order History</div>
          {orders.map((o,i)=>(
            <div key={i} style={{...s.adminCard,marginTop:'12px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'8px'}}>
                <div>
                  <div style={{fontWeight:'700',fontSize:'15px'}}>{o.num}</div>
                  <div style={{fontSize:'11px',color:'rgba(238,238,248,0.3)',marginTop:'2px'}}>{o.date}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                  <span style={{...s.badge,background:o.status==='Delivered'?'rgba(52,211,153,0.15)':o.status==='Shipped'?'rgba(99,102,241,0.15)':'rgba(251,191,36,0.12)',color:o.status==='Delivered'?'#34d399':o.status==='Shipped'?'#818cf8':'#fbbf24'}}>{o.status}</span>
                  <span style={{fontWeight:'800',fontSize:'16px'}}>${o.total.toFixed(2)}</span>
                </div>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginTop:'10px'}}>
                {o.items.map((item,j)=><span key={j} style={{fontSize:'11px',background:'rgba(255,255,255,0.05)',padding:'3px 8px',borderRadius:'5px',color:'rgba(238,238,248,0.55)'}}>{item}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADMIN */}
      {page==='admin'&&(
        <div style={s.page}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'24px',flexWrap:'wrap',gap:'12px'}}>
            <div>
              <div style={{fontSize:'24px',fontWeight:'800',letterSpacing:'-0.5px'}}>Admin Dashboard</div>
              <div style={{fontSize:'13px',color:'rgba(238,238,248,0.3)',marginTop:'4px'}}>Real-time analytics</div>
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <span style={{...s.badge,background:'rgba(52,211,153,0.1)',color:'#34d399',padding:'5px 12px'}}>● Live</span>
              <button style={s.btnPri} onClick={()=>alert('🤖 ML retraining triggered!')}>Retrain AI</button>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'12px',marginBottom:'24px'}}>
            {[{icon:'💰',label:'Revenue',val:'$847K',sub:'↑ 12.4%'},{icon:'📦',label:'Orders',val:'12,847',sub:'↑ 8.2%'},{icon:'👥',label:'Users',val:'24,591',sub:'↑ 23.1%'},{icon:'🛍️',label:'Products',val:'1,284',sub:'18 low stock'}].map(c=>(
              <div key={c.label} style={s.adminCard}>
                <div style={{fontSize:'24px',marginBottom:'10px'}}>{c.icon}</div>
                <div style={{fontSize:'10px',color:'rgba(238,238,248,0.3)',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'4px'}}>{c.label}</div>
                <div style={{fontSize:'26px',fontWeight:'800',letterSpacing:'-1px'}}>{c.val}</div>
                <div style={{fontSize:'11px',color:'#34d399',marginTop:'4px'}}>{c.sub}</div>
              </div>
            ))}
          </div>
          <div style={s.adminCard}>
            <div style={{fontWeight:'700',fontSize:'15px',marginBottom:'16px'}}>AI Recommendation Engine</div>
            {[{label:'Click-Through Rate',val:'18.4%',fill:18,color:'#818cf8'},{label:'Conversion Uplift',val:'+62%',fill:62,color:'#34d399'},{label:'Model Accuracy',val:'84.7%',fill:84.7,color:'#22d3ee'}].map(m=>(
              <div key={m.label} style={{marginBottom:'16px'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',marginBottom:'6px'}}>
                  <span style={{color:'rgba(238,238,248,0.55)'}}>{m.label}</span>
                  <span style={{fontWeight:'700',color:m.color}}>{m.val}</span>
                </div>
                <div style={{height:'4px',background:'rgba(255,255,255,0.06)',borderRadius:'4px',overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${m.fill}%`,background:m.color,borderRadius:'4px'}}></div>
                </div>
              </div>
            ))}
          </div>
          <div style={{...s.adminCard,marginTop:'16px'}}>
            <div style={{fontWeight:'700',fontSize:'15px',marginBottom:'16px'}}>Products</div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
                <thead><tr>{['Product','Category','Price','Stock','Rating'].map(h=><th key={h} style={{padding:'8px 10px',textAlign:'left',fontSize:'10px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.5px',color:'rgba(238,238,248,0.3)',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>{h}</th>)}</tr></thead>
                <tbody>{PRODUCTS.map(p=>(
                  <tr key={p.id}>
                    <td style={{padding:'10px',borderBottom:'1px solid rgba(255,255,255,0.03)'}}><span style={{fontSize:'18px',marginRight:'8px'}}>{p.icon}</span><span style={{fontWeight:'600'}}>{p.name}</span></td>
                    <td style={{padding:'10px',borderBottom:'1px solid rgba(255,255,255,0.03)'}}><span style={{...s.badge,background:'rgba(34,211,238,0.1)',color:'#22d3ee',padding:'2px 8px'}}>{p.cat}</span></td>
                    <td style={{padding:'10px',fontWeight:'700',borderBottom:'1px solid rgba(255,255,255,0.03)'}}>${p.price.toFixed(2)}</td>
                    <td style={{padding:'10px',borderBottom:'1px solid rgba(255,255,255,0.03)'}}><span style={{...s.badge,background:'rgba(52,211,153,0.1)',color:'#34d399',padding:'2px 8px'}}>In Stock</span></td>
                    <td style={{padding:'10px',color:'#fbbf24',borderBottom:'1px solid rgba(255,255,255,0.03)'}}>★ {p.rating}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}