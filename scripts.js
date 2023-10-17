const productoDOM = document.querySelector(".productos__center")
const carritoDOM = document.querySelector(".carrito")
const carritoCenter = document.querySelector(".carrito__center")
const openCarrito = document.querySelector(".carrito__icon")
const closeCarrito = document.querySelector(".close__carrito")
const overlay = document.querySelector(".carrito__overlay")
const carritoTotal = document.querySelector(".carrito__total")
const clearCarritoBtn = document.querySelector(".clear__carrito")
const itemTotales =document.querySelector(".item__total")
const detalles = document.getElementById('detalles')

let carrito = [];
let buttonDOM = [];

class UI {

	detalleProducto(codigo){
		const filtroDato = productos.filter(item => item.codigo == codigo)
		let result = ""
		filtroDato.forEach(producto => {
			result += `
			<article class="detalle-grid">
				<img src=${producto.imagen} alt="${producto.descripcion}" class="img-fluid">
				<div class="detalles-content">
					<h3>${producto.descripcion}</h3>
					<div class="rating">
						<span>
							${generarEstrellas(producto.puntuacion)}
						</span>
					</div>
						<p class="precio"><b>Precio: </b> ARS ${producto.precio}</p>
						<p class="description">
							<b>Descripcion: </b> <span>${producto.detalle}</span>
						</p>

						<div class="bottom">
							<div class="btn__group">
								<button class="btn addToCart" data-codigo=${producto.codigo}>Añadir carrito</button>
								<a href="index.html" class="btn back"><span>Volver a tienda</span></a>
							</div>
						</div>
				</div>
			</article>
			`
		});
		detalles.innerHTML = result;
	}

	renderProductos(productos){
		let result = ""
		productos.forEach((producto) =>{
			result += `
			<div class="producto">
				<div class="image__container">
					<img loading="lazy" src=${producto.imagen} alt="">
				</div>
				<div class="producto__footer">
					<h1>${producto.descripcion}</h1>
					<div class="rating">
						<span>
							${generarEstrellas(producto.puntuacion)}
						</span>
					</div>
					<div class="precio">ARS ${producto.precio}</div>
				</div>
				<div class="bottom">
					<div class="btn__group">
					<button class="btn addToCart" data-codigo=${producto.codigo}>Añadir carrito</button>
					<a href="producto-detalles.html?codigo=${producto.codigo}" class="btn view"><span>Vista</span></a>
					</div>
				</div>
			</div>
				`
		});
		productoDOM.innerHTML = result
	}

	getButtons(){
		const buttons = [...document.querySelectorAll(".addToCart")];
		buttonDOM = buttons;
		buttons.forEach((button)=> {
			const codigo = button.dataset.codigo;
			const inCart = carrito.find(item => item.codigo === parseInt(codigo, 10));

			if(inCart){
				button.innerHTML = "En el carrito";
				button.disabled = true;
			}
			button.addEventListener("click", e =>{
				e.preventDefault();
				e.target.innerHTML = "En el carrito";
				e.target.disabled = true;
				
				const carritoItem = {...Storage.getProductos(codigo), cantidad: 1}

				carrito = [...carrito, carritoItem]

				Storage.saveCart(carrito)

				this.setItemValues(carrito)
				this.addCarritoItem(carritoItem)
				
			})
		})
	}

	setItemValues(carrito){
		let tempTotal = 0;
		let itemTotal = 0;
		const spanEnCarrito = document.querySelector(".item__total");
		carrito.map(item => {
			tempTotal += item.precio * item.cantidad;
			itemTotal += item.cantidad;
		});
		carritoTotal.innerText = parseFloat(tempTotal.toFixed(2));
		itemTotales.innerText = itemTotal
		if (itemTotal >= 1) {
			itemTotales.innerText = itemTotal;
			spanEnCarrito.style.display = "inline";
		} else {
			spanEnCarrito.style.display = "none";
		}
	}

	addCarritoItem({imagen, precio, descripcion, codigo}){
		const div = document.createElement("div")
		div.classList.add("carrito__item")

		div.innerHTML = `
		<img src=${imagen} alt=${descripcion}>
		<div>
			<h3>${descripcion}</h3>
			<p class="precio">ARS ${precio}</p>
		</div>
		<div>
			<span class="increase" data-codigo=${codigo}>
				<i class="bx bxs-up-arrow"></i>
			</span>
			<p class="item__cantidad">1</p>
			<span class="decrease" data-codigo=${codigo}>
				<i class="bx bxs-down-arrow"></i>
			</span>
		</div>
		<div>
			<span class="remove__item" data-codigo=${codigo}>
				<i class="bx bx-trash"></i>
			</span>
		</div>
		`
		carritoCenter.appendChild(div)
	}
	show(){
		carritoDOM.classList.add("show")
		overlay.classList.add("show")
	}
	hide(){
		carritoDOM.classList.remove("show")
		overlay.classList.remove("show")
	}
	setAPP(){
		carrito = Storage.getCart()
		this.setItemValues(carrito)
		this.populate(carrito)
		openCarrito.addEventListener("click", this.show)
		closeCarrito.addEventListener("click", this.hide)
	}
	populate(carrito){
		carrito.forEach(item => this.addCarritoItem(item))
	}
	cartLogic(){
		clearCarritoBtn.addEventListener("click", () =>{
			this.clearCarrito()
			this.hide()
		});

		carritoCenter.addEventListener("click", e =>{
			const target = e.target.closest("span")
			const targetElement = target.classList.contains("remove__item");
			console.log(target)
			console.log(targetElement)
			if(!target) return
			if(targetElement){
				const codigo = parseInt(target.dataset.codigo);
				this.removeItem(codigo)
				carritoCenter.removeChild(target.parentElement.parentElement)
			}else if(target.classList.contains("increase")){
				const codigo = parseInt(target.dataset.codigo, 10);
				let tempItem = carrito.find(item => item.codigo === codigo);
				tempItem.cantidad++;
				Storage.saveCart(carrito)
				this.setItemValues(carrito)
				target.nextElementSibling.innerText = tempItem.cantidad
			}else if(target.classList.contains("decrease")){
				const codigo = parseInt(target.dataset.codigo, 10);
				let tempItem = carrito.find(item => item.codigo === codigo);
				tempItem.cantidad--;

				if(tempItem.cantidad > 0){
					Storage.saveCart(carrito);
					this.setItemValues(carrito);
					target.previousElementSibling.innerText = tempItem.cantidad;
				}else{
					this.removeItem(codigo);
					carritoCenter.removeChild(target.parentElement.parentElement)
				}
			}
		});
	}
	clearCarrito(){
		const cartItems = carrito.map(item => item.codigo)
		cartItems.forEach(codigo => this.removeItem(codigo))

		while(carritoCenter.children.length > 0){
			carritoCenter.removeChild(carritoCenter.children[0])
		}
	}
	removeItem(codigo){
		carrito = carrito.filter(item => item.codigo !== codigo);
		this.setItemValues(carrito)
		Storage.saveCart(carrito)
		let button = this.singleButton(codigo);
		if(button){
			button.disabled = false;
			button.innerText = "Añadir carrito"
		}
	}
	singleButton(codigo){
		return buttonDOM.find(button => parseInt(button.dataset.codigo) === codigo)
	}
}

class Storage {
	static saveProduct(obj){
		localStorage.setItem("productos", JSON.stringify(obj))
	}
	static saveCart(carrito){
		localStorage.setItem("carrito", JSON.stringify(carrito))
	}
	static getProductos(codigo){
		const producto = JSON.parse(localStorage.getItem("productos"))
		return producto.find(product =>product.codigo === parseFloat(codigo, 10))
	}
	static getCart(){
		return localStorage.getItem("carrito") ? JSON.parse(localStorage.getItem("carrito")) : [];
	}
}

class Productos {
	async getProductos() {
	  try {
			const response = await fetch("productos.json");
			if (!response.ok) {
				throw new Error("No se pudo cargar el archivo 'productos.json'");
			}
			const data = await response.json();
			const productos = data.items;
			return productos;
	  	} 
		catch (error) {
			console.error("Error al obtener productos:", error);
			return [];
	  	}
	}
}

let category = "";
let productos  = [];

function categoryValue(){
	const ui = new UI();

	category = document.getElementById("category").value
	if(category.length > 0){
		const producto = productos.filter(regx => regx.category === category)
		ui.renderProductos(producto)
		ui.getButtons();
	}else{
		ui.renderProductos(productos)
		ui.getButtons();
	
	}
}

//CARGAR HTML ASINCRONICAMENTE

document.addEventListener("DOMContentLoaded", async () => {

    const productosLista = new Productos();
    const ui = new UI();

    ui.setAPP();

    try {
        productos = await productosLista.getProductos();

        const query = new URLSearchParams(window.location.search);
        const codigo = query.get('codigo');

        if (codigo) {
            ui.detalleProducto(codigo);
            Storage.saveProduct(productos);
            ui.getButtons();
            ui.cartLogic();
        } else {
            ui.renderProductos(productos);
            Storage.saveProduct(productos);
            ui.getButtons();
            ui.cartLogic();
        }
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
});

//GENERAR ESTRELLAS DESDE JSON

function generarEstrellas(asteriscos, puntuacionMaxima = 5) {
    const estrellaLlena = '<i class="bx bxs-star"></i>';
    const estrellaVacia = '<i class="bx bx-star"></i>';

    let estrellasHTML = '';

    for (let i = 0; i < puntuacionMaxima; i++) {
        if (i < asteriscos.length && asteriscos[i] === '*') {
            estrellasHTML += estrellaLlena;
        } else {
            estrellasHTML += estrellaVacia;
        }
    }

    return estrellasHTML;
}
const puntuacionAsteriscos = '***';
const estrellasHTML = generarEstrellas(puntuacionAsteriscos);



