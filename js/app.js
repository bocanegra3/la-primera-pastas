
const contenedor = document.querySelector("#contenedor");
const divCarrito = document.querySelector("#carrito");
const cantidadCarrito = document.querySelector("#cantidadCarrito");
const btnFinalizarCompra = document.querySelector("#btnFinalizarCompra");

let carrito = [];

const linkCarrito = document.querySelector("#linkCarrito");

const actualizarCantidadGlobal = () => {
  const totalUnidades = carrito.reduce((acc, p) => acc + p.cantidad, 0);
  linkCarrito.textContent = `🛒 (${totalUnidades})`;
};



const actualizarTotal = () => {
  const total = carrito.reduce((acc, producto) => {
    return acc + producto.precio * producto.cantidad;
  }, 0);

  let totalDiv = divCarrito.querySelector(".total");

  if (!totalDiv) {
    totalDiv = document.createElement("div");
    totalDiv.className = "mt-3 fw-bold text-end total";
    divCarrito.appendChild(totalDiv);
  }

  totalDiv.textContent = `Total: $${total}`;
};



const llamadoAlServidor = async () => {
  const titulo = document.getElementById("titulo");
  let llamada = await fetch("../prods.json");
  let data = await llamada.json();
  titulo.innerText = "Productos";

  data.forEach((producto) => {
    let div = document.createElement("div");    
    div.innerHTML = `      
    <img src="${producto.img}" class="card-img-top" alt="imagenes del producto">
    <div class="card-body">
    <h5 class="card-title">${producto.nombre}</h5>
    <p class = "badge text-bg-primary"> ${producto.categoria}</p>
    <p class="card-text">${producto.descripcion}</p>
    <p class="price">$ ${producto.precio},00 </p>
    <button data-id=${producto.id} class = "btnAgregar btn btn-outline-success">Agregar al carrito</button> 
     </div> 

    `
    contenedor.appendChild(div);
  });
  //Hasta aca se añadio la posibilidad de agregar un carrito al producto, utilizando los productos de json.........................................
  const btnAgregar = document.querySelectorAll(".btnAgregar");
  btnAgregar.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      const Seleccionado = data.find((p) => String(p.id) === String(id));
      let EnCarrito = carrito.find((p) => p.id === Seleccionado.id);
      actualizarCantidadGlobal();
      Swal.fire({      
      position: "top-end",
      icon: "success",
      title: "Has agregado el producto",
      showConfirmButton: false,
      timer: 888
      }); 
      if (!EnCarrito) {
        EnCarrito = { ...Seleccionado, cantidad: 1 };
        carrito.push(EnCarrito);
       

        const item = document.createElement("div");
        item.className = "d-flex justify-content-between align-items-center border-bottom py-2";
        item.setAttribute("data-id", Seleccionado.id);

        item.innerHTML = `
          <div class="d-flex align-items-center gap-2">
            <img class="img2" src="${Seleccionado.img || Seleccionado.img}" style="width:48px;height:48px;object-fit:cover">
            <span>${Seleccionado.nombre}</span>
            <span class="qty badge bg-secondary">1</span>
          </div>              
             <button class="btnEliminar btn btn-danger btn-sm" data-id="${Seleccionado.id}">X</button>    
          <strong class="precioCarrito">$${Seleccionado.precio}</strong>
          <span class="total"></span>
        `;
        divCarrito.appendChild(item);
      } else {      
        EnCarrito.cantidad++;
        const item = divCarrito.querySelector(`[data-id="${EnCarrito.id}"]`);
        const qtySpan = item?.querySelector(".qty");
        if (qtySpan) qtySpan.textContent = EnCarrito.cantidad;        
      }
      actualizarCantidadGlobal();
      actualizarTotal();
    });

  });

  divCarrito.addEventListener("click", (e) => {
  if (e.target.classList.contains("btnEliminar")) {
    const id = e.target.dataset.id;

  const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success",
    cancelButton: "btn btn-danger"    
  },
  buttonsStyling: false
  });

  swalWithBootstrapButtons.fire({
  title: "Estas seguro?",
  text: "Si eliminas no tiene retorno!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonText: "Si, deseo eliminar!",
  cancelButtonText: "No, cancelar!",
  reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
    carrito = carrito.filter((producto) => producto.id != id);
    const item = divCarrito.querySelector(`[data-id="${id}"]`);
    if (item) item.remove();

    actualizarTotal();
    actualizarCantidadGlobal();

    swalWithBootstrapButtons.fire({
      title: "Eliminado!",
      text: "El producto fue eliminado del carrito.",
      icon: "success"
    });
  } else if (
    /* Read more about handling dismissals below */
    result.dismiss === Swal.DismissReason.cancel
  ) {
    swalWithBootstrapButtons.fire({
      title: "Cancelado",
      text: "Bien hecho, mantienes el producto",
      icon: "error"
    });    
  }
  });


  } 
  });

   


  actualizarTotal();
  btnFinalizarCompra.addEventListener("click", () => {
  const totalCarrito = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

  if (totalCarrito === 0) {
    Swal.fire({
      icon: "info",
      title: "Tu carrito está vacío",
      text: "Agrega algún producto antes de finalizar la compra."
    });
    return;
  }

  Swal.fire({
    title: "¿Deseas finalizar la compra?",
    text: `Total a pagar: $${totalCarrito}`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, ir a pagar"
  }).then((result) => {
    if (result.isConfirmed) {
  Swal.fire({
  title: "<strong>Metodo <u>de Pago</u></strong>",
  icon: "info",
  html: `
    Haz click en el siguiente link <b>-></b>,
    <a href="https://www.mercadopago.com.ar/" autofocus target="_blank">Mercado Pago</a>,
    para concretar la compra.
  `,
  showCloseButton: true,
  showCancelButton: true,
  focusConfirm: false,
  confirmButtonText: `
    <i class="fa fa-thumbs-up"></i> Listo!
  `,
  confirmButtonAriaLabel: "Thumbs up, great!",
  cancelButtonText: `
    <i class="fa fa-thumbs-down">No por el momento</i>
  `,
  cancelButtonAriaLabel: "Thumbs down"
  
  }).then((result) => {
    
      if (result.isConfirmed) {
        carrito = [];        
        divCarrito.innerHTML = "";   
        actualizarTotal();         
        actualizarCantidadGlobal();  

        Swal.fire("¡Gracias por tu compra!", "", "success");
      }

    });
    }
  });
});

  

};

llamadoAlServidor();