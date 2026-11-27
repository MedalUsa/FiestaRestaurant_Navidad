import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { bookUrl, categories, dishes, questions, whatsapp, type Category, type Dish } from './book'
import './style.css'

const consultUrl = whatsapp('Hola, quisiera asesoría para mi mesa de Navidad.')
const reserveUrl = whatsapp('Hola, quisiera consultar una reserva de mesa.')
const storageKey = 'fiesta.navidad.book.2026'
function readSelection(): number[] {
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(storageKey) || '[]')
    return Array.isArray(saved) ? dishes.filter(dish => saved.includes(dish.id)).map(d => d.id) : []
  } catch { return [] }
}
function Logo() { return <img className="brand" src="./book/fiesta.svg" width="114" height="40" alt="Fiesta Restaurant"/> }
function BagIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 8h14l1.5 13h-17L5 8Z"/><path d="M8.5 9V6a3.5 3.5 0 0 1 7 0v3"/></svg>
}
function External({href,children,className}: {href:string;children:ReactNode;className?:string}) {
  return <a href={href} className={className} target="_blank" rel="noopener noreferrer">{children} <svg aria-hidden="true" width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 13 13 3M4 3h9v9"/></svg></a>
}
function Header({count,onOrder}:{count:number;onOrder:()=>void}) {
  const [open,setOpen]=useState(false)
  const header=useRef<HTMLElement>(null)
  const trigger=useRef<HTMLButtonElement>(null)
  useEffect(()=>{
    if(!open) return
    function outside(event:PointerEvent){if(!header.current?.contains(event.target as Node))setOpen(false)}
    function escape(event:KeyboardEvent){if(event.key==='Escape'){setOpen(false);trigger.current?.focus()}}
    document.addEventListener('pointerdown',outside)
    document.addEventListener('keydown',escape)
    return ()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape)}
  },[open])
  return <header className="mast" ref={header}><div className="mast-inner">
    <button ref={trigger} className="hamb" aria-label={open?'Cerrar menú':'Abrir menú'} aria-expanded={open} aria-controls="nav-movil" onClick={()=>setOpen(!open)}>{open?'×':<svg width="19" height="15" viewBox="0 0 20 16" aria-hidden="true"><path d="M1 3h17M1 8h17M1 13h17" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>}</button>
    <a href="#inicio" aria-label="Fiesta, inicio" onClick={()=>setOpen(false)}><Logo/></a>
    <nav className="desktop-nav" aria-label="Principal"><a href="#book">Book navideño</a><External href={reserveUrl}>Consulta reservas</External><button onClick={onOrder}><BagIcon/> Mis pedidos{count>0 && ' ('+count+')'}</button></nav>
    {count>0 && <button className="quick-order" onClick={onOrder} aria-label={'Mis pedidos, '+count+' platos'}><BagIcon/> {count}</button>}
    <nav id="nav-movil" className="mobile-panel" aria-label="Navegación móvil" hidden={!open} onClick={()=>setOpen(false)}>
      <a href="#book">Book navideño</a><a href="#entregas">Entregas y pagos</a><External href={reserveUrl}>Reservar una mesa</External><button onClick={onOrder}>Mis pedidos{count>0 && ' ('+count+')'}</button>
    </nav>
  </div></header>
}
function PhotoCard({dish,added,onPhoto,onToggle}:{dish:Dish;added:boolean;onPhoto:()=>void;onToggle:()=>void}){
  return <article className="dish">
    <button className="dish-image" onClick={onPhoto} aria-label={'Ampliar foto de '+dish.name}>
      <img src={dish.photo} width="600" height="500" alt={dish.name} loading="lazy" decoding="async"/><span className="enlarge" aria-hidden="true"><img src="./book/ampliar.svg" alt=""/></span>
    </button>
    <div className="dish-details"><p className="eyebrow">{dish.category}</p><h4>{dish.name}</h4>
    <div className="action-row"><span aria-label="Precio por confirmar">S/ —</span><button className={added?'add added':'add'} aria-pressed={added} aria-label={(added?'Quitar ':'Agregar ')+dish.name} onClick={onToggle}>{added?'Agregado ✓':'Agregar +'}</button></div></div>
  </article>
}
function Catalog({selected,toggle,show}:{selected:number[];toggle:(id:number)=>void;show:(dish:Dish)=>void}){
  const [mode,setMode]=useState<'Menú navideño'|'Congelados'>('Menú navideño')
  const [filter,setFilter]=useState<Category|'Todos'>('Todos')
  const selector=useRef<HTMLDetailsElement>(null)
  const rail=useRef<HTMLDivElement>(null)
  const filters=['Todos',...categories] as const
  const frozen=mode==='Congelados'
  const visible=dishes.filter(d=>frozen?d.category==='Congelados':d.category!=='Congelados' && (filter==='Todos'||d.category===filter))
  const [atStart,setAtStart]=useState(true),[atEnd,setAtEnd]=useState(false)
  function syncRail(){
    const el=rail.current
    if(el){setAtStart(el.scrollLeft<3);setAtEnd(el.scrollLeft+el.clientWidth>=el.scrollWidth-3)}
  }
  useEffect(()=>{
    const el=rail.current
    if(!el) return
    el.scrollLeft=0
    const observer=new ResizeObserver(syncRail)
    observer.observe(el);syncRail()
    return ()=>observer.disconnect()
  },[filter,mode])
  function move(dir:number){
    const el=rail.current,first=el?.firstElementChild,next=first?.nextElementSibling
    if(el && first && next)el.scrollBy({left:dir*(next.getBoundingClientRect().left-first.getBoundingClientRect().left),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})
  }
  return <section id="book" className="catalog shell">
    <h2 className="script book-title">Book navideño</h2>
    <div className="modes" aria-label="Tipo de menú">{(['Menú navideño','Congelados'] as const).map(type=><button key={type} aria-pressed={mode===type} onClick={()=>{setMode(type);setFilter('Todos'); if(selector.current)selector.current.open=false}}>{type}</button>)}</div>
    <h3 className="script menu-title">{mode}</h3>
    <p className="intro">Elige para tu mesa platos de nuestra cocina para compartir en casa.</p>
    {!frozen && <><div className="desktop-filters" aria-label="Filtrar platos">{filters.map(f=><button key={f} aria-pressed={filter===f} onClick={()=>setFilter(f)}>{f}</button>)}</div>
    <details ref={selector} className="mobile-filters"><summary>{filter==='Todos'?'Todos los platos':filter}<span aria-hidden="true">⌄</span></summary>
    <div>{filters.map(f=><button key={f} aria-pressed={filter===f} onClick={()=>{setFilter(f);if(selector.current){selector.current.open=false;selector.current.querySelector('summary')?.focus()}}}>{f==='Todos'?'Todos los platos':f}</button>)}</div></details></>}
    <div className="dish-grid" ref={rail} onScroll={syncRail} aria-label={mode}>{visible.map(dish=><PhotoCard key={dish.id} dish={dish} added={selected.includes(dish.id)} onPhoto={()=>show(dish)} onToggle={()=>toggle(dish.id)}/>)}</div>
    <div className="rail-controls"><span aria-live="polite">{visible.length} platos</span><div><button aria-label="Plato anterior" disabled={atStart} onClick={()=>move(-1)}>←</button><button aria-label="Plato siguiente" disabled={atEnd} onClick={()=>move(1)}>→</button></div></div>
  </section>
}
function Help(){
  const [open,setOpen]=useState<number|null>(()=>matchMedia('(min-width: 761px)').matches?0:null)
  return <><section className="help shell"><div><p className="eyebrow">Te ayudamos a pedir</p><h2>¿Cuántos serán<br/> en tu mesa?</h2></div><div><p>Te ayudamos a elegir los platos y las cantidades para tu celebración.</p><External className="btn red" href={consultUrl}>Asesoría por WhatsApp</External></div></section>
  <section className="delivery" id="entregas"><div className="shell faq-layout"><div><p className="eyebrow">Entregas y pedidos</p><h2 className="script">Tu pedido,<br className="wide-break"/> a tiempo.</h2><p>Los detalles para llevar nuestra cocina a tu celebración.</p><External href={consultUrl} className="btn outline">Consultar por WhatsApp</External><small>Fechas y condiciones tentativas. Sujetas a confirmación.</small></div>
  <div className="questions">{questions.map(([q,a],i)=><div key={q}><h3><button aria-expanded={open===i} aria-controls={'respuesta-'+i} onClick={()=>setOpen(open===i?null:i)}>{q}<span aria-hidden="true">{open===i?'−':'+'}</span></button></h3><p hidden={open!==i} id={'respuesta-'+i}>{a}</p></div>)}</div></div></section></>
}
function Footer(){return <footer><div className="shell"><div className="footer-main">
  <div className="locations"><h3>Fiesta Chiclayo</h3><p>Av. Salaverry 1820, Chiclayo 14011</p><a href="https://wa.me/51924516825">+51 924 516 825</a><h3>Fiesta Miraflores</h3><p>Av. Reducto 1278, Miraflores</p><a href="https://wa.me/51932483302">+51 932 483 302</a></div><div className="social"><Logo/><a href="https://www.instagram.com/fiestarestaurantgourmet/" target="_blank" rel="noreferrer">@fiestarestaurantgourmet</a></div>
  <div className="legal"><a href="#entregas">Condiciones de pedido</a><span>Libro de reclamaciones</span></div></div><div className="footer-end"><small>© 2026 Fiesta Restaurant</small><strong>#EL_PRODUCTO_NO_ES_NEGOCIABLE</strong></div></div></footer>}
type Overlay={type:'photo';dish:Dish}|{type:'order'}
function Modal({overlay,onClose,selected,toggle}:{overlay:Overlay;onClose:()=>void;selected:number[];toggle:(id:number)=>void}){
  const dialog=useRef<HTMLDialogElement>(null)
  useEffect(()=>{const el=dialog.current!;el.showModal();const old=document.body.style.overflow;document.body.style.overflow='hidden';return ()=>{el.close();document.body.style.overflow=old}},[])
  const photo=overlay.type==='photo'?overlay.dish:null
  const items=dishes.filter(d=>selected.includes(d.id))
  const msg='Hola, quisiera consultar disponibilidad y precios para este pedido navideño:\n'+items.map(d=>'• '+d.name).join('\n')
  return <dialog ref={dialog} className={photo?'lightbox':'order'} aria-label={photo?'Vista ampliada':'Mis pedidos'} onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===dialog.current)onClose()}}>
    <div className="modal-inner"><div className="modal-top"><span>{photo?'Vista ampliada':'Fiesta Restaurant'}</span><button onClick={onClose} aria-label="Cerrar">×</button></div>
    {photo?<figure><img src={photo.photo} alt={photo.name}/><figcaption><p className="eyebrow">{photo.category}</p><h2>{photo.name}</h2></figcaption></figure>:<><h2 className="script">Mis pedidos</h2>{items.length?<><ul>{items.map(d=><li key={d.id}><img src={d.photo} alt=""/><span>{d.name}</span><button onClick={()=>toggle(d.id)} aria-label={'Quitar '+d.name}>Quitar</button></li>)}</ul><External href={whatsapp(msg)} className="btn red">Consultar mi selección por WhatsApp</External></>:<p>Elige los platos que quieres consultar en la carta.</p>}</>}
    <button className="return" onClick={onClose}>Volver a la carta</button></div></dialog>
}
function App(){
  const [selected,setSelected]=useState<number[]>(readSelection)
  const [overlay,setOverlay]=useState<Overlay|null>(null)
  useEffect(()=>{try{sessionStorage.setItem(storageKey,JSON.stringify(selected))}catch{/* La selección sigue disponible durante esta visita. */}},[selected])
  function toggle(id:number){setSelected(current=>current.includes(id)?current.filter(v=>v!==id):[...current,id])}
  return <><a className="skip" href="#book">Ir a la carta</a><Header count={selected.length} onOrder={()=>setOverlay({type:'order'})}/>
    <main><section id="inicio" className="hero"><img className="hero-photo" src="./book/mesa.webp" alt="" fetchPriority="high" width="1440" height="1024"/><div className="hero-inner"><h1>La mesa <em className="script">de Navidad</em></h1><p>Nuestra cocina, en tu mesa.<br/>Elige los platos que compartirás esta Navidad.</p><External className="btn ivory" href={bookUrl}>Ver book navideño</External></div></section>
    <aside className="availability"><span>Productos sujetos a disponibilidad.</span><strong>#EL_PRODUCTO_NO_ES_NEGOCIABLE</strong></aside>
    <Catalog selected={selected} toggle={toggle} show={dish=>setOverlay({type:'photo',dish})}/><Help/></main><Footer/>
    {overlay && <Modal overlay={overlay} onClose={()=>setOverlay(null)} selected={selected} toggle={toggle}/>}</>
}
createRoot(document.getElementById('root')!).render(<App/>)
