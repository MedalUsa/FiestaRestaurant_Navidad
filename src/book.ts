export const categories = ['Campo y corral', 'Arroces', 'Guarniciones', 'La pastelería', 'Bebidas'] as const
export type Category = (typeof categories)[number] | 'Congelados'
export type Dish = { id: number; name: string; category: Category; photo: string }

const menu: ReadonlyArray<readonly [Category, string[]]> = [
  ['Campo y corral', ['Pavo criollo al horno', 'Pavo al Orange', 'Codillo de cerdo laqueado', 'Lechal de Batangrande']],
  ['Arroces', ['Arroz gourmet by Bertha Cruz', 'Arroz frito blanco', 'Arroz navideño Fiesta']],
  ['Guarniciones', ['Puré de membrillo especiado', 'La huerta de temporada']],
  ['La pastelería', ['Tocino de cielo y frutos del bosque', 'Pan Rafa', 'Cookies de cacao y sal de Cusco']],
  ['Bebidas', ['Clericó Blanco Fiesta', 'Pisco Sour', 'Tinto de verano navideño']],
  ['Congelados', ['Codillo de cerdo congelado al vacío', 'Doble costilla de cabrito congelada', 'Pato a la naranja congelado', 'Pavo asado navideño envasado al vacío']]
]
export const dishes: Dish[] = menu.flatMap(([category,names]) => names.map(name => ({category,name})))
  .map((dish,index) => ({...dish, id: index+1, photo: `./book/plato-${String(index+1).padStart(2,'0')}.webp`}))
export const questions = [
  ['Fechas de pedido y entrega','Pedidos hasta el 20 de diciembre. Entregas el 23 y 24 de diciembre, en horario coordinado.'],
  ['Delivery y recojo','Recojo en Fiesta Miraflores o Chiclayo. Delivery sujeto a cobertura. El costo y el horario se coordinan según tu dirección.'],
  ['Pagos y confirmación','Transferencia, Yape o tarjeta. La confirmación del pedido queda sujeta a la disponibilidad de los platos y a la validación del pago.']
] as const
export const bookUrl = 'https://canva.link/ap347g3wals6lix'
export const whatsapp = (message: string, number = '51932483302') =>
  'https://wa.me/' + number + '?text=' + encodeURIComponent(message)
