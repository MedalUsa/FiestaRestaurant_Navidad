import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { categories, products, type Product } from "./menu";
import {
  available,
  calendarDays,
  count,
  dateLabel,
  lines,
  persist,
  readSession,
  sol,
  total,
  type Basket,
  type Receipt,
  type Sede,
} from "./model";
import "./style.css";
import "./motion.css";
import { captureScene, type Scene } from "./motion";

const media = (file: string) => "./media/" + file;
const go = (path: string) => {
  location.hash = path;
};
const readRoute = () => location.hash.slice(1).split("/");
const logo = (
  <img className="logo" src={media("logo.png")} alt="Fiesta Restaurant" />
);
function Step({ n, change }: { n: number; change: (n: number) => void }) {
  return (
    <div className="step">
      <button
        aria-label="Disminuir cantidad"
        disabled={n <= 1}
        onClick={() => change(n - 1)}
      >
        −
      </button>
      <span>{n}</span>
      <button
        aria-label="Aumentar cantidad"
        disabled={n >= 10}
        onClick={() => change(n + 1)}
      >
        +
      </button>
    </div>
  );
}
function FoodImage({ p, square = false }: { p: Product; square?: boolean }) {
  const file = square && p.id === "1-0" ? "arroz-detalle" : p.photo;
  return (
    <img className={"food photo" + (square ? " square" : "")}
      src={media(file + ".webp")} alt={p.name} />
  );
}
function Card({ done, back }: { done: () => void; back: () => void }) {
  const [num, setNum] = useState(""),
    [exp, setExp] = useState(""),
    [cv, setCv] = useState(""),
    [error, setError] = useState("");
  return (
    <section className="sheet">
      <button className="back" onClick={back}>
        ‹ Finalizar compra
      </button>
      <h1>Medio de pago</h1>
      <h2>Ingresar tarjeta</h2>
      <p className="note">Usa la tarjeta de prueba para continuar.</p>
      <button
        className="textbtn"
        onClick={() => {
          setNum("4242424242424242");
          setExp("12/29");
          setCv("123");
          setError("");
        }}
      >
        Usar tarjeta de prueba
      </button>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (num !== "4242424242424242" || exp !== "12/29" || cv !== "123") {
            setError("Usa la tarjeta de prueba para continuar.");
            return;
          }
          done();
        }}
      >
        <label>
          Número de tarjeta
          <input
            inputMode="numeric"
            autoComplete="off"
            placeholder="0000 0000 0000 0000"
            value={num.replace(/(.{4})(?=.)/g, "$1 ")}
            onChange={(e) =>
              setNum(e.target.value.replace(/\D/g, "").slice(0, 16))
            }
            required
          />
        </label>
        <div className="twocol">
          <label>
            Vencimiento
            <input
              inputMode="numeric"
              autoComplete="off"
              placeholder="MM/AA"
              value={exp}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                setExp(v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v);
              }}
              required
            />
          </label>
          <label>
            Código de seguridad
            <input
              inputMode="numeric"
              type="password"
              autoComplete="off"
              placeholder="CVV"
              value={cv}
              onChange={(e) =>
                setCv(e.target.value.replace(/\D/g, "").slice(0, 3))
              }
              required
            />
          </label>
        </div>
        {error && <p role="alert">{error}</p>}
        <button className="solid">Guardar para esta compra</button>
      </form>
    </section>
  );
}
function App() {
  const [s, set] = useState(readSession),
    [route, setRoute] = useState(readRoute),
    [qty, setQty] = useState(1),
    [notice, tell] = useState(""),
    [editing, edit] = useState(false),
    [block, setBlock] = useState(0);
  const [page = "", param = ""] = route;
  const transition = useRef<ReturnType<typeof captureScene>>(undefined);
  function transitionTo(scene: Scene, path: string, origin: HTMLElement) {
    transition.current?.cleanup();
    transition.current = captureScene(scene, path, origin);
    go(path);
  }
  useLayoutEffect(() => {
    const pending = transition.current;
    if (!pending) return;
    transition.current = undefined;
    if (pending.destination === route.join("/")) pending.play();
    else pending.cleanup();
    return pending.cleanup;
  }, [route]);

  const validCat = Number(param);
  const cat = Number.isInteger(validCat) && categories[validCat] ? validCat : 0;
  const item = products.find((p) => p.id === param);
  const order = s.orders.find((o) => o.id === param);
  const [highlight, choose] = useState("0-1");
  const selected =
    products.find((p) => p.id === highlight && p.category === cat) ||
    products.find((p) => p.category === cat)!;
  const tabs = useRef<HTMLElement>(null);
  const [mobile, setMobile] = useState(
    () => matchMedia("(max-width:740px)").matches,
  );
  useEffect(() => {
    const m = matchMedia("(max-width:740px)");
    const fn = () => setMobile(m.matches);
    m.addEventListener("change", fn);
    return () => m.removeEventListener("change", fn);
  }, []);
  useEffect(() => {
    const fn = () => {
      setRoute(readRoute());
      setQty(1);
      edit(false);
      tell("");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  useEffect(() => {
    persist(s);
  }, [s]);
  useEffect(() => {
    if (page === "carta" && mobile) {
      const el = tabs.current?.querySelector<HTMLElement>(
        '[aria-current="page"]',
      );
      if (el && tabs.current)
        tabs.current.scrollLeft = el.offsetLeft - tabs.current.offsetLeft - 24;
    }
  }, [cat, page, mobile]);
  const patch = (v: Partial<typeof s>) => set((prev) => ({ ...prev, ...v }));
  const setN = (id: string, n: number) =>
    set((prev) => {
      const bag = { ...prev.bag };
      if (n > 0) bag[id] = Math.min(10, n);
      else delete bag[id];
      return { ...prev, bag };
    });
  function add(p: Product) {
    const old = s.bag[p.id] || 0;
    setN(p.id, old + qty);
    tell(
      old >= 10
        ? "Máximo de 10 unidades de este plato."
        : "Añadido a tu pedido.",
    );
  }
  const isCover = !page || page === "inicio";
  const dark = isCover || ["carta", "plato", "confirmacion"].includes(page);
  const openDish = (p: Product) => {
    choose(p.id);
    tell("");
    setQty(1);
    if (mobile) go("plato/" + p.id);
  };
  const tabnav = (
    <nav className="tabs" ref={tabs} aria-label="Categorías">
      {categories.map((v, i) => (
        <button
          key={v.name}
          aria-current={cat === i ? "page" : undefined}
          onClick={() => go("carta/" + i)}
        >
          {v.name}
        </button>
      ))}
    </nav>
  );
  const addControls = (p: Product) => (
    <>
      <div className="actions">
        <Step n={qty} change={setQty} />
        <button className="cream-button" onClick={() => add(p)}>
          ＋ Añadir a la bolsa
        </button>
      </div>
      <div className="feedback" role="status">
        {notice && (
          <>
            {notice}{" "}
            <button onClick={() => go("bolsa")}>Ver mi pedido →</button>
          </>
        )}
      </div>
    </>
  );
  function bagItems(b: Basket, mutable: boolean) {
    return lines(b).map((p) => (
      <article key={p.id} className="orderline">
        <div>
          <h3>{p.name}</h3>
          <p>
            {b[p.id]} × {sol(p.price)}
          </p>
          {mutable && (
            <div className="editline">
              <Step n={b[p.id]} change={(n) => setN(p.id, n)} />
              <button className="textbtn" onClick={() => setN(p.id, 0)}>
                Quitar
              </button>
            </div>
          )}
        </div>
        <FoodImage p={p} square />
      </article>
    ));
  }
  function confirm(origin: HTMLButtonElement) {
    if (location.hash !== "#checkout") return;
    if (
      !count(s.bag) ||
      !available(s.place, s.day) ||
      !s.hasCard ||
      !s.name.trim()
    )
      return;
    const id = "F-" + (1048 + s.orders.length);
    const receipt: Receipt = {
      id,
      items: { ...s.bag },
      name: s.name.trim(),
      day: s.day,
      place: s.place,
    };
    transitionTo("payment", "confirmacion/" + id, origin);
    patch({ orders: [...s.orders, receipt], bag: {}, hasCard: false, day: "" });
  }
  const bagLink = (
    <button className="baglink" onClick={() => go("bolsa")}>
      Mi pedido ({count(s.bag)})
    </button>
  );
  return (
    <div
      className={
        "site " + (dark ? "wine " : "ivory ") + (isCover ? "coverpage" : "")
      }
    >
      {isCover ? (
        <main className="cover">
          <header>{logo}</header>
          <div className="invite">
            <p>EDICIÓN 2026</p>
            <picture>
              <source
                media="(max-width:740px)"
                srcSet={media("titulo-movil.webp")}
              />
              <img src={media("titulo.png")} alt="La mesa de Navidad" />
            </picture>
            <button onClick={(e) => transitionTo("envelope", "carta/0", e.currentTarget)}>
              Abrir la carta <span>→</span>
            </button>
          </div>
          <div className="flap" />
        </main>
      ) : (
        <>
          <header className="mast">
            <span className="mastlabel">Carta navideña</span>
            <button onClick={() => go("inicio")} aria-label="Fiesta, inicio">
              {logo}
            </button>
            {page === "carta" || page === "plato" || page === "bolsa" ? (
              bagLink
            ) : (
              <span />
            )}
          </header>
          <main>
            {page === "carta" ? (
              <section className="catalog">
                <h1 className="scriptlabel">
                  <img src={media("carta.webp")} alt="Carta navideña" />
                </h1>
                {tabnav}
                <div className="spread">
                  <div className="contents">
                    <h2 className="chapter">
                      <img src={media("titulo-" + categories[cat].art + ".webp")}
                        alt={categories[cat].title} />
                    </h2>
                    <img
                      className="etch"
                      src={media(categories[cat].art + ".webp")}
                      alt=""
                    />
                    {cat === 0 && (
                      <img className="sprig" src={media("rama.webp")} alt="" />
                    )}
                    <div className="dishlist">
                      {products
                        .filter((p) => p.category === cat)
                        .map((p) => (
                          <div
                            key={p.id}
                            className={
                              "dishrow " +
                              (p.id === selected.id ? "selected" : "")
                            }
                          >
                            <button onClick={() => openDish(p)}>
                              <span>{p.name}</span>
                              <i aria-hidden="true">›</i>
                            </button>
                            <p>{p.description}</p>
                            {!mobile && selected.id === p.id && addControls(p)}
                          </div>
                        ))}
                    </div>
                  </div>
                  {!mobile && (
                    <figure>
                      <FoodImage p={selected} />
                      <figcaption>
                        {selected.name}
                        {selected.description && " · " + selected.description}
                      </figcaption>
                    </figure>
                  )}
                </div>
              </section>
            ) : page === "plato" && item ? (
              <section className="detail">
                <button
                  className="back"
                  onClick={() => go("carta/" + item.category)}
                >
                  ‹ {categories[item.category].name}
                </button>
                <FoodImage p={item} />
                <div className="detailcopy">
                  <h1>{item.name}</h1>
                  <p>{item.description}</p>
                  <p>{sol(item.price)}</p>
                  {addControls(item)}
                </div>
              </section>
            ) : page === "bolsa" ? (
              <section className="sheet">
                <button className="back" onClick={() => go("carta/0")}>
                  ‹ Volver a la carta
                </button>
                <h1>Tu pedido</h1>
                {count(s.bag) ? (
                  <>
                    {bagItems(s.bag, true)}
                    <p className="total">
                      Subtotal <span>{sol(total(s.bag))}</span>
                    </p>
                    <button className="solid" onClick={() => go("checkout")}>
                      Continuar al pago
                    </button>
                    <button className="textbtn" onClick={() => go("carta/0")}>
                      Seguir eligiendo
                    </button>
                  </>
                ) : (
                  <>
                    <p>Tu bolsa está vacía.</p>
                    <button className="solid" onClick={() => go("carta/0")}>
                      Ver la carta
                    </button>
                  </>
                )}
                {s.orders.length > 0 && (
                  <button
                    className="textbtn"
                    onClick={() => go("pedido/" + s.orders.at(-1)!.id)}
                  >
                    Ver último pedido →
                  </button>
                )}
              </section>
            ) : page === "tarjeta" && count(s.bag) > 0 ? (
              <Card
                back={() => go("checkout")}
                done={() => {
                  patch({ hasCard: true });
                  go("checkout");
                }}
              />
            ) : page === "checkout" && count(s.bag) > 0 ? (
              <section className="sheet checkout">
                <button className="back" onClick={() => go("bolsa")}>
                  ‹ Tu pedido
                </button>
                <h1>Finalizar compra</h1>
                <span className="label">Contacto</span>
                {editing ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const value = String(
                        new FormData(e.currentTarget).get("name") || "",
                      ).trim();
                      if (value) {
                        patch({ name: value });
                        edit(false);
                      }
                    }}
                  >
                    <label>
                      Nombre
                      <input
                        name="name"
                        defaultValue={s.name}
                        required
                        maxLength={64}
                        autoFocus
                      />
                    </label>
                    <button className="textbtn">Guardar</button>
                  </form>
                ) : (
                  <div className="contact">
                    {s.name}{" "}
                    <button className="textbtn" onClick={() => edit(true)}>
                      Editar
                    </button>
                  </div>
                )}
                <fieldset>
                  <legend>Sede de recojo</legend>
                  {(["Fiesta Lima", "Fiesta Chiclayo"] as Sede[]).map(
                    (place) => (
                      <label className="radio" key={place}>
                        <input
                          type="radio"
                          name="place"
                          checked={s.place === place}
                          onChange={() =>
                            patch({
                              place,
                              day: available(place, s.day) ? s.day : "",
                            })
                          }
                        />
                        {place}
                      </label>
                    ),
                  )}
                </fieldset>
                <div className="label">Fecha de recojo</div>
                <div className="calhead">
                  <button
                    aria-label="Cuatro semanas anteriores"
                    disabled={block === 0}
                    onClick={() => setBlock(0)}
                  >
                    ‹
                  </button>
                  <h2>{block ? "Dic. 2026 – ene. 2027" : "Diciembre 2026"}</h2>
                  <button
                    aria-label="Cuatro semanas siguientes"
                    disabled={block === 1}
                    onClick={() => setBlock(1)}
                  >
                    ›
                  </button>
                </div>
                <div className="cal">
                  {["L", "M", "X", "J", "V", "S", "D"].map((v) => (
                    <small key={v}>{v}</small>
                  ))}
                  {calendarDays(block).map((day) => (
                    <button
                      key={day}
                      aria-label={dateLabel(day)}
                      aria-pressed={s.day === day}
                      disabled={!available(s.place, day)}
                      onClick={() => patch({ day })}
                    >
                      {Number(day.slice(-2))}
                    </button>
                  ))}
                </div>
                <button className="cardlink" onClick={() => go("tarjeta")}>
                  {s.hasCard
                    ? "Tarjeta •••• 4242"
                    : "Ingresar tarjeta de prueba"}{" "}
                  <span>{s.hasCard ? "Cambiar" : "→"}</span>
                </button>
                <p>
                  {count(s.bag)} {count(s.bag) === 1 ? "unidad" : "unidades"}
                </p>
                <p className="total">
                  Total <span>{sol(total(s.bag))}</span>
                </p>
                {(!s.day || !s.hasCard) && (
                  <p className="note">
                    {!s.day ? "Elige una fecha de recojo. " : ""}
                    {!s.hasCard ? "Selecciona la tarjeta de prueba." : ""}
                  </p>
                )}
                <button
                  className="solid"
                  disabled={!s.hasCard || !s.day || editing}
                  onClick={(e) => confirm(e.currentTarget)}
                >
                  Pagar {sol(total(s.bag))}
                </button>
              </section>
            ) : page === "confirmacion" && order ? (
              <section className="sheet confirm">
                <h1>
                  {order.name.split(/\s+/)[0]}, tu pedido está confirmado.
                </h1>
                <div className="pickup">
                  <p>
                    Te esperamos el día {dateLabel(order.day)} en {order.place}.
                  </p>
                  <img src={media("vajilla.webp")} alt="" />
                </div>
                <h2>Pedido {order.id}</h2>
                <p>
                  {count(order.items)} unidades · {sol(total(order.items))}
                </p>
                <button
                  className="textbtn"
                  onClick={() => go("pedido/" + order.id)}
                >
                  Ver mi pedido →
                </button>
              </section>
            ) : page === "pedido" && order ? (
              <section className="sheet">
                <h1>Mi pedido</h1>
                <p>
                  {order.id} · {order.name}
                </p>
                <p className="pickupinfo">
                  Recojo en {order.place}
                  <br />
                  {dateLabel(order.day)}
                </p>
                {bagItems(order.items, false)}
                <p className="total">
                  Total <span>{sol(total(order.items))}</span>
                </p>
                <button className="textbtn" onClick={() => go("carta/0")}>
                  Volver a la carta
                </button>
              </section>
            ) : (
              <section className="sheet">
                <h1>La carta de Fiesta</h1>
                <button className="textbtn" onClick={() => go("carta/0")}>
                  Abrir la carta →
                </button>
              </section>
            )}
          </main>
        </>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
