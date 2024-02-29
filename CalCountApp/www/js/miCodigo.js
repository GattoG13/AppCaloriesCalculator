/* Variables y constantes */
const APIbaseURL = "https://calcount.develotion.com";
let usuarioLogueado = null;
let registrosUsuarios = [];
let alimentosRegistrados = [];
let paisesValidos = [];
let map = null;
let markerUsuario = null;
let markerPais = null;
let markerPaisesPimeados = [];
// Asumo que el usuario está en ORT, luego si logro acceder a la ubicación del usuario, la actualizo.
let posicionUsuario = {
  latitude: -34.903816878014354,
  longitude: -56.19059048108193,
};

const MENU = document.querySelector("#menu");
const ROUTER = document.querySelector("#ruteo");
const NAV = document.querySelector("#nav");
const PANTALLA_HOME = document.querySelector("#pantalla-home");
const PANTALLA_LOGIN = document.querySelector("#pantalla-login");
const PANTALLA_REGISTRO = document.querySelector("#pantalla-registro");
const PANTALLA_REGISTROALIMENTO = document.querySelector(
  "#pantalla-registroAlimento"
);
const PANTALLA_LISTARREGISTROS = document.querySelector(
  "#pantalla-listarRegistros"
);
const PANTALLA_MAPA = document.querySelector("#pantalla-mapa");

/* Inicialización */
inicializar();

function inicializar() {
  ButtonHandler();
  cargarPaises();
  cargarPosicionUsuario();
}

function ButtonHandler() {
  // Login
  document
    .querySelector("#btnLoginIngresar")
    .addEventListener("click", btnLogin);
  // Registro
  document.querySelector("#btnRegistro").addEventListener("click", btnRegistro);
  // Inicio -- Registrar alimento
  document
    .querySelector("#btnRegistrarComida")
    .addEventListener("click", registrarAlimento);
  // Ruteo
  ROUTER.addEventListener("ionRouteDidChange", navegar);
  // Mapa
  document
    .querySelector("#btnMapaUsuarios")
    .addEventListener("click", cargarInfoMapa);
  //ListarTodosLosRegistros
  document
    .querySelector("#btnListarRegistros")
    .addEventListener("click", listarTodosLosRegistros);
  //FiltrarLosRegistrosPorFecha
  document
    .querySelector("#btnFiltrarFechas")
    .addEventListener("click", filtrarPorFecha);
}

function actualizarUsuarioLocalStorage() {
  const usuarioGuardado = localStorage.getItem("APPCalcountUsuarioLogueado");
  if (usuarioGuardado) {
    usuarioLogueado = JSON.parse(usuarioGuardado);
  } else {
    usuarioLogueado = null;
  }
}

function verificarInicio() {
  if (usuarioLogueado) {
    NAV.setRoot("page-registroAlimento");
    NAV.popToRoot();
  } else {
    NAV.setRoot("page-login");
    NAV.popToRoot();
  }
}

/* Ruteo */
function navegar(evt) {
  actualizarUsuarioLocalStorage();
  actualizarMenu();
  ocultarPantallas();
  const pantallaDestino = evt.detail.to;
  switch (pantallaDestino) {
    case "/":
      verificarInicio();
      break;
    case "/login":
      mostrarLogin();
      break;
    case "/registro":
      mostrarRegistro();
      break;
    case "/registroAlimento":
      CargarComboAlimentos();
      mostrarRegistroAlimento();
      break;
    case "/listarAlimentos":
      obtenerAlimentosListado();
      obtenerRegistros();
      mostrarListadoRegistros();
      break;
    case "/mapa":
      mostrarMapa();
      break;
  }
}

/* Interfaz de usuario - Menú */
function ocultarOpcionesMenu() {
  document.querySelector("#btnMenuLogin").style.display = "none";
  document.querySelector("#btnMenuRegistro").style.display = "none";
  document.querySelector("#btnMenuRegistroComida").style.display = "none";
  document.querySelector("#btnMenuCerrarSesion").style.display = "none";
  document.querySelector("#btnMenuListarRegistros").style.display = "none";
  document.querySelector("#btnMapa").style.display = "none";
}

function actualizarMenu() {
  ocultarOpcionesMenu();
  if (usuarioLogueado) {
    document.querySelector("#btnMenuRegistroComida").style.display = "block";
    document.querySelector("#btnMenuListarRegistros").style.display = "block";
    document.querySelector("#btnMenuCerrarSesion").style.display = "block";
    document.querySelector("#btnMapa").style.display = "block";
  } else {
    document.querySelector("#btnMenuLogin").style.display = "block";
    document.querySelector("#btnMenuRegistro").style.display = "block";
  }
}

/* Interfaz de usuario - Pantallas */
function ocultarPantallas() {
  PANTALLA_HOME.style.display = "none";
  PANTALLA_LOGIN.style.display = "none";
  PANTALLA_REGISTRO.style.display = "none";
  PANTALLA_REGISTROALIMENTO.style.display = "none";
  PANTALLA_LISTARREGISTROS.style.display = "none";
  PANTALLA_MAPA.style.display = "none";
}

function mostrarLogin() {
  PANTALLA_LOGIN.style.display = "block";
}
function mostrarRegistro() {
  PANTALLA_REGISTRO.style.display = "block";
}
function mostrarRegistroAlimento() {
  PANTALLA_REGISTROALIMENTO.style.display = "block";
}
function mostrarListadoRegistros() {
  PANTALLA_LISTARREGISTROS.style.display = "block";
}
function mostrarMapa() {
  PANTALLA_MAPA.style.display = "block";
  inicializarMapa();
}

/* Logout */
function cerrarSesion() {
  cerrarMenu();
  localStorage.clear();
  usuarioLogueado = null;
  NAV.setRoot("page-login");
  NAV.popToRoot();
}

/* Menú */
function cerrarMenu() {
  MENU.close();
}

/* PAGINA LOGIN */
function btnLogin() { 
  const UsuarioIngresado = document.querySelector("#txtLoginUsuario").value;
  const passwordIngresado = document.querySelector("#txtLoginPassword").value;
  if (UsuarioIngresado && passwordIngresado) {
    const url = APIbaseURL + "/login.php";
    const data = {
      usuario: UsuarioIngresado,
      password: passwordIngresado,
    };
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.mensaje) {
          mostrarToast("ERROR", "Error", data.mensaje);
        } else {
          vaciarCamposLogin();
          localStorage.setItem(
            "APPCalcountUsuarioLogueado",
            JSON.stringify(Usuario.parse(data))
          );
          mostrarToast("SUCCESS", "Ingreso exitoso", "Se ha iniciado sesión.");
          NAV.setRoot("page-registroAlimento");
          NAV.popToRoot();
        }
      })
      .catch((error) => {
        console.log(error);
        mostrarToast("ERROR", "Error", "Por favor, intente nuevamente.");
      });
  } else {
    mostrarToast("ERROR", "Error", "Todos los campos son obligatorios.");
  }
}

function vaciarCamposLogin() {
  document.querySelector("#txtLoginUsuario").value = "";
  document.querySelector("#txtLoginPassword").value = "";
}

/* PAGINA REGISTRO */
function btnRegistro() {
  const UsuarioIngresado = document.querySelector("#txtRegistroUsuario").value;
  const pais = document.querySelector("#slcRegistroPaises").value;
  const passwordIngresado = document.querySelector(
    "#txtRegistroPassword"
  ).value;
  const verificacionPasswordIngresada = document.querySelector(
    "#txtRegistroVerificacionPassword"
  ).value;
  const caloriasIngresadas = document.querySelector("#nCaloriasDiarias").value;

  if (
    UsuarioIngresado &&
    passwordIngresado &&
    verificacionPasswordIngresada &&
    caloriasIngresadas > 0 &&
    pais != null
  ) {
    if (passwordIngresado === verificacionPasswordIngresada) {
      const url = APIbaseURL + "/usuarios.php";
      const data = {
        usuario: UsuarioIngresado,
        pais: pais,
        password: passwordIngresado,
        caloriasDiarias: caloriasIngresadas,
      };

      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (response.status === 200) {
            vaciarCamposRegistro();
            mostrarToast(
              "SUCCESS",
              "Registro exitoso",
              "Ya puede iniciar sesión."
            );
            NAV.setRoot("page-login");
            NAV.popToRoot();
          }
          return response.json();
        })
        .then((data) => {
          if (data.mensaje) {
            mostrarToast("ERROR", "Error", data.mensaje);
          }
        })
        .catch((error) => {
          console.log(error);
          mostrarToast("ERROR", "Error", "Por favor, intentelo nuevamente");
        });
    } else {
      mostrarToast(
        "ERROR",
        "Error",
        "El password y la verificación no coinciden."
      );
    }
  } else {
    mostrarToast(
      "ERROR",
      "Error",
      "Todos los campos son obligatorios y las calorias deben ser superior a 0."
    );
  }
}

function vaciarCamposRegistro() {
  document.querySelector("#txtRegistroUsuario").value = "";
  document.querySelector("#slcRegistroPaises").value = "";
  document.querySelector("#txtRegistroPassword").value = "";
  document.querySelector("#txtRegistroVerificacionPassword").value = "";
}

// Cargar paises select registro
function cargarPaises() {
  const url = APIbaseURL + "/paises.php";
  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      //llegan los paises aca
      if (data) {
        let ionOption = "";
        for (let i = 0; i < data.paises.length; i++) {
          const pais = data.paises[i];
          paisesValidos.push(Pais.parse(pais));
          ionOption += `<ion-select-option value="${pais.id}">${pais.name}</ion-select-option>`;
        }
        document.querySelector("#slcRegistroPaises").innerHTML = ionOption;
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

/* PAGINA REGISTRAR ALIMENTO */
function registrarAlimento() {
  const slcAlimentoSeleccionado = document.querySelector(
    "#slcRegistroAlimentos"
  ).value;
  const cantidadAlimentoIngresado =
    document.querySelector("#rCantidadAlimento").value;
  const fechaIngresada = document.querySelector("#rFecha").value;
  let fechaActual = new Date();
  fechaActual.setDate(fechaActual.getDate());
  let año = fechaActual.getFullYear();
  let mes = ("0" + (fechaActual.getMonth() + 1)).slice(-2);
  let dia = ("0" + fechaActual.getDate()).slice(-2);
  //yyyy-mm-dd
  let fechaFormateada = `${año}-${mes}-${dia}`;
  if (
    slcAlimentoSeleccionado &&
    cantidadAlimentoIngresado &&
    fechaIngresada &&
    cantidadAlimentoIngresado > 0
  ) {
    if (fechaIngresada <= fechaFormateada) {
      const url = APIbaseURL + "/registros.php";
      const data = {
        idAlimento: slcAlimentoSeleccionado,
        idUsuario: usuarioLogueado.id,
        cantidad: cantidadAlimentoIngresado,
        fecha: fechaIngresada,
      };

      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apiKey: usuarioLogueado.apiKey,
          idUser: usuarioLogueado.id,
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.codigo == 200) {
            JSON.stringify(Registro.parse(data));
            mostrarToast("SUCCESS", "Alimento registrado exitosamente");
            vaciarCamposRegistroAlimento();
          } else {
            mostrarToast("ERROR", "Error", data.mensaje);
          }
        })
        .catch((error) => {
          console.log(error);
          mostrarToast("ERROR", "Error", "Por favor, intentelo nuevamente");
        });
    } else {
      mostrarToast(
        "ERROR",
        "Error",
        "La fecha ingresada debe ser actual o un día anterior"
      );
      return; // Aquí agregamos el return para salir de la función
    }
  } else {
    mostrarToast(
      "ERROR",
      "Error",
      "Todos los campos son obligatorios y la cantidad de alimento debe ser mayor a 0"
    );
  }
}

function vaciarCamposRegistroAlimento() {
  document.querySelector("#slcRegistroAlimentos").value = "";
  document.querySelector("#rCantidadAlimento").value = "";
  document.querySelector("#rFecha").value = "";
}

function CargarComboAlimentos() {
  if (usuarioLogueado != null) {
    const url = APIbaseURL + "/alimentos.php";
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apiKey: usuarioLogueado.apiKey,
        idUser: usuarioLogueado.id,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data) {
          let ionOption = "";
          for (let i = 0; i < data.alimentos.length; i++) {
            const alimento = data.alimentos[i];
            ionOption += `<ion-select-option value="${alimento.id}">${alimento.nombre}, Calorias:${alimento.calorias}, Proteinas:${alimento.proteinas} UNIDAD: ${alimento.porcion}</ion-select-option>`;
          }
          document.querySelector("#slcRegistroAlimentos").innerHTML = ionOption;
        }
      })
      .catch((error) => {
        console.log(error);
        mostrarToast("ERROR", "Error", "Por favor, intentelo nuevamente");
      });
  }
}

/* PAGINA LISTAR REGISTROS */
function obtenerAlimentosListado() {
  alimentosRegistrados = [];
  caloriasTotales = 0;
  const url = APIbaseURL + "/alimentos.php";
  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apiKey: usuarioLogueado.apiKey,
      idUser: usuarioLogueado.id,
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      for (let i = 0; i < data.alimentos.length; i++) {
        const alimento = data.alimentos[i];
        alimentosRegistrados.push(Alimento.parse(alimento));
      }
    })
    .catch((error) => {
      console.log(error);
      mostrarToast("ERROR", "Error", "Por favor, inténtelo nuevamente");
    });
}

function obtenerRegistros() {
  const url = APIbaseURL + "/registros.php?idUsuario=" + usuarioLogueado.id;
  caloriasTotales = 0;
  caloriasDiarias = 0;
  document.querySelector("#divListado").innerHTML = "";

  let fechaActual = new Date();
  fechaActual.setDate(fechaActual.getDate());
  let año = fechaActual.getFullYear();
  let mes = ("0" + (fechaActual.getMonth() + 1)).slice(-2);
  let dia = ("0" + fechaActual.getDate()).slice(-2);
  //yyyy-mm-dd
  let fechaFormateada = `${año}-${mes}-${dia}`;
  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: usuarioLogueado.apiKey,
      iduser: usuarioLogueado.id,
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      let divIonListado = "";
      document.querySelector("#pListado").innerHTML = "";
      if (data.registros.length == 0) {
        document.querySelector("#pListado").innerHTML =
          "No hay registros de comida aún. Registre una comida";
      } else {
        for (let i = data.registros.length - 1; i >= 0; i--) {
          const registroActual = data.registros[i];
          for (let j = 0; j < alimentosRegistrados.length; j++) {
            const alimentoActual = alimentosRegistrados[j];
            if (alimentoActual.id == registroActual.idAlimento) {
              caloriasTotales +=
                alimentoActual.calorias * registroActual.cantidad;
              if (fechaFormateada === registroActual.fecha) {
                caloriasDiarias +=
                  alimentoActual.calorias * registroActual.cantidad;
              }
              divIonListado += `
                            <ion-card>
                                
                                <ion-card-header>
                                    <ion-card-title>${
                                      alimentoActual.nombre
                                    } <img alt="Silhouette of mountains" src="${alimentoActual.obtenerURLImagen()}" /></ion-card-title>
                                    <ion-card-subtitle>
                                    </ion-item> 
                                    <ion-label>Calorias ingeridas:</ion-label>
                                    <ion-badge color="danger">${
                                      alimentoActual.calorias *
                                      registroActual.cantidad
                                    }</ion-badge>
                                    </ion-item> 
                                </ion-card-header>
                                <ion-card-content>
                                <ion-list>
                                <ion-item>
                                  <ion-label>Cantidad:</ion-label>
                                  <ion-badge color="primary">${
                                    registroActual.cantidad
                                  }</ion-badge>
                                </ion-item>
                                <ion-item>
                                  <ion-label>Calorias por porcion (${
                                    alimentoActual.porcion
                                  }):</ion-label>
                                  <ion-badge color="primary">${
                                    alimentoActual.calorias
                                  }</ion-badge>
                                </ion-item>                                
                                <ion-item>
                                  <ion-label>Proteinas:</ion-label>
                                  <ion-badge color="primary">${
                                    alimentoActual.proteinas
                                  }</ion-badge>
                                </ion-item> 
                                    <ion-item>
                                    <ion-label>Fecha de registro:</ion-label>
                                    <ion-badge color="primary">${
                                      registroActual.fecha
                                    }</ion-badge>
                                </ion-item> 
                                </ion-list>
                                <br>
                                <ion-button color="danger" onclick="eliminarRegistro(${
                                  registroActual.id
                                })">Eliminar</ion-button>
                                </ion-card-content>
                            </ion-card>
                            <br>`;
            }
          }
        }
        document.querySelector("#divListado").innerHTML = divIonListado;
        colorPorCalorias(
          document.querySelector("#caloriasTotalesEnElDia"),
          caloriasDiarias
        );

        document.querySelector("#caloriasTotales").innerHTML = caloriasTotales;
        document.querySelector("#caloriasTotalesEnElDia").innerHTML =
          caloriasDiarias;
      }
    })

    .catch((error) => {
      console.log(error);
      mostrarToast("ERROR", "Error", "Por favor, intente nuevamente.");
    });
}

/* btn Listar todos los registros */
function listarTodosLosRegistros() {
  document.querySelector("#divListado").innerHTML = "";
  const url = APIbaseURL + "/registros.php?idUsuario=" + usuarioLogueado.id;
  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: usuarioLogueado.apiKey,
      iduser: usuarioLogueado.id,
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      document.querySelector("#pListado").innerHTML = "";
      if (data.registros.length == 0) {
        document.querySelector("#pListado").innerHTML =
          "No hay registros de comida aún. Registre una comida";
      } else {
        for (let i = data.registros.length - 1; i >= 0; i--) {
          const registroActual = data.registros[i];
          for (let j = 0; j < alimentosRegistrados.length; j++) {
            const alimentoActual = alimentosRegistrados[j];
            if (alimentoActual.id == registroActual.idAlimento) {
              document.querySelector("#divListado").innerHTML += `
                <ion-card>
                    
                    <ion-card-header>
                        <ion-card-title>${
                          alimentoActual.nombre
                        } <img alt="Silhouette of mountains" src="${alimentoActual.obtenerURLImagen()}" /></ion-card-title>
                        <ion-card-subtitle>
                        </ion-item> 
                        <ion-label>Calorias ingeridas:</ion-label>
                        <ion-badge color="danger">${
                          alimentoActual.calorias * registroActual.cantidad
                        }</ion-badge>
                        </ion-item> 
                    </ion-card-header>
                    <ion-card-content>
                    <ion-list>
                    <ion-item>
                      <ion-label>Cantidad:</ion-label>
                      <ion-badge color="primary">${
                        registroActual.cantidad
                      }</ion-badge>
                    </ion-item>
                    <ion-item>
                      <ion-label>Calorias por porcion (${
                        alimentoActual.porcion
                      }):</ion-label>
                      <ion-badge color="primary">${
                        alimentoActual.calorias
                      }</ion-badge>
                    </ion-item>                                
                    <ion-item>
                      <ion-label>Proteinas:</ion-label>
                      <ion-badge color="primary">${
                        alimentoActual.proteinas
                      }</ion-badge>
                    </ion-item> 
                        <ion-item>
                        <ion-label>Fecha de registro:</ion-label>
                        <ion-badge color="primary">${
                          registroActual.fecha
                        }</ion-badge>
                    </ion-item> 
                    </ion-list>
                    <br>
                    <ion-button color="danger" onclick="eliminarRegistro(${
                      registroActual.id
                    })">Eliminar</ion-button>
                    </ion-card-content>
                </ion-card>
                <br>`;
            }
          }
        }
      }
    })
    .catch((error) => {
      console.log(error);
      mostrarToast("ERROR", "Error", "Por favor, intente nuevamente.");
    });
}

/* btn Filtrar registros por fecha */
function filtrarPorFecha() {
  const fechaIni = document.querySelector("#fechaIni").value;
  const fechaFin = document.querySelector("#fechaFin").value;
  document.querySelector("#divListado").innerHTML = "";
  const url = APIbaseURL + "/registros.php?idUsuario=" + usuarioLogueado.id;
  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apikey: usuarioLogueado.apiKey,
      iduser: usuarioLogueado.id,
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      document.querySelector("#pListado").innerHTML = "";
      if (data.registros.length == 0) {
        document.querySelector("#pListado").innerHTML =
          "No hay registros de comida aún. Registre una comida";
      } else {
        if (fechaIni <= fechaFin) {
          for (let i = data.registros.length - 1; i >= 0; i--) {
            const registroActual = data.registros[i];
            if (
              registroActual.fecha >= fechaIni &&
              registroActual.fecha <= fechaFin
            ) {
              for (let j = 0; j < alimentosRegistrados.length; j++) {
                const alimentoActual = alimentosRegistrados[j];
                if (alimentoActual.id == registroActual.idAlimento) {
                  document.querySelector("#divListado").innerHTML += `
                <ion-card>
                    
                    <ion-card-header>
                        <ion-card-title>${
                          alimentoActual.nombre
                        } <img alt="Silhouette of mountains" src="${alimentoActual.obtenerURLImagen()}" /></ion-card-title>
                        <ion-card-subtitle>
                        </ion-item> 
                        <ion-label>Calorias ingeridas:</ion-label>
                        <ion-badge color="danger">${
                          alimentoActual.calorias * registroActual.cantidad
                        }</ion-badge>
                        </ion-item> 
                    </ion-card-header>
                    <ion-card-content>
                    <ion-list>
                    <ion-item>
                      <ion-label>Cantidad:</ion-label>
                      <ion-badge color="primary">${
                        registroActual.cantidad
                      }</ion-badge>
                    </ion-item>
                    <ion-item>
                      <ion-label>Calorias por porcion (${
                        alimentoActual.porcion
                      }):</ion-label>
                      <ion-badge color="primary">${
                        alimentoActual.calorias
                      }</ion-badge>
                    </ion-item>                                
                    <ion-item>
                      <ion-label>Proteinas:</ion-label>
                      <ion-badge color="primary">${
                        alimentoActual.proteinas
                      }</ion-badge>
                    </ion-item> 
                        <ion-item>
                        <ion-label>Fecha de registro:</ion-label>
                        <ion-badge color="primary">${
                          registroActual.fecha
                        }</ion-badge>
                    </ion-item> 
                    </ion-list>
                    <br>
                    <ion-button color="danger" onclick="eliminarRegistro(${
                      registroActual.id
                    })">Eliminar</ion-button>
                    </ion-card-content>
                </ion-card>
                <br>`;
                }
              }
            }
          }
        } else {
          mostrarToast(
            "ERROR",
            "Error",
            "La fecha final debe ser superior o igual a la fecha inicial."
          );
        }
      }
    })
    .catch((error) => {
      console.log(error);
      mostrarToast("ERROR", "Error", "Por favor, intente nuevamente.");
    });
}

/*cambiar color calorias diarias */
function colorPorCalorias(caloriasElement, calorias) {
  const caloriasDiarias = usuarioLogueado.caloriasDiarias;
  const limiteInferior = caloriasDiarias * 0.9;
  if (calorias > caloriasDiarias) {
    caloriasElement.setAttribute("color", "danger");
  } else if (calorias >= limiteInferior && calorias <= caloriasDiarias) {
    caloriasElement.setAttribute("color", "warning");
  } else {
    caloriasElement.setAttribute("color", "success");
  }
}

function eliminarRegistro(idRegistro) {
  const fechaIni = document.querySelector("#fechaIni").value;
  const fechaFin = document.querySelector("#fechaFin").value;
  const url = APIbaseURL + "/registros.php?idRegistro=" + idRegistro;
  fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      apikey: usuarioLogueado.apiKey,
      iduser: usuarioLogueado.id,
    },
  })
    .then((response) => {
      if (response) {
        mostrarToast("SUCCESS", "Registro eliminado correctamente");
        obtenerRegistros();
        document.querySelector("#fechaIni").value = "";
        document.querySelector("#fechaFin").value = "";
      } else {
        mostrarToast(
          "ERROR",
          "Error al eliminar el registro",
          "Por favor, intente nuevamente."
        );
      }
    })
    .catch((error) => {
      console.error("Error en la solicitud fetch:", error);
      mostrarToast("ERROR", "Error", "Por favor, inténtelo nuevamente");
    });
}

/* PANTALLA MAPA */
function cargarPosicionUsuario() {
  if (Capacitor.isNativePlatform()) {
    // Cargo la posición del usuario desde el dispositivo.
    const loadCurrentPosition = async () => {
      const resultado = await Capacitor.Plugins.Geolocation.getCurrentPosition({
        timeout: 3000,
      });
      if (resultado.coords && resultado.coords.latitude) {
        posicionUsuario = {
          latitude: resultado.coords.latitude,
          longitude: resultado.coords.longitude,
        };
      }
    };
    loadCurrentPosition();
  } else {
    // Cargo la posición del usuario desde el navegador web.
    window.navigator.geolocation.getCurrentPosition(
      // Callback de éxito.
      function (pos) {
        if (pos && pos.coords && pos.coords.latitude) {
          posicionUsuario = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
        }
      },
    );
  }
}

function inicializarMapa() {
  if (!map) {
    map = L.map("mapa-usuarios").setView(
      [posicionUsuario.latitude, posicionUsuario.longitude],
      15
    );
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    markerUsuario = L.marker([
      posicionUsuario.latitude,
      posicionUsuario.longitude,
    ])
      .addTo(map)
      .bindPopup("Aquí te encuentras tú")
      .openPopup();
  }
}

function esSudamericano(idPais) {
  for (let unP of paisesValidos) {
    if (unP.id == idPais) return true;
  }
  return false;
}

function obtenerLatitudePais(idPais) {
  for (let unP of paisesValidos) {
    if (unP.id == idPais) return unP.latitude;
  }
}

function obtenerLongitudPais(idPais) {
  for (let unP of paisesValidos) {
    if (unP.id == idPais) return unP.longitude;
  }
}

function marcarPaisesEnMapa(data) {
  let latP;
  let longP;
  let filtro = Number(document.querySelector("#cantidadUsuariosEnMapa").value);
  if (filtro > 0) {
    for (let unP of data.paises) {
      if (esSudamericano(unP.id)) {
        if (unP.cantidadDeUsuarios >= filtro) {
          latP = obtenerLatitudePais(unP.id);
          longP = obtenerLongitudPais(unP.id);
          markerPais = L.marker([latP, longP]).addTo(map);
          map.setView([-26.508920051665154, -61.91802420569826], 3);
          markerPaisesPimeados.push(markerPais);
        }
      }
    }
  } else {
    mostrarToast("ERROR", "Error", "Debe ingresar un numero mayor a 0");
  }
}

function cargarInfoMapa() {
  const url = APIbaseURL + "/usuariosPorPais.php";
  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      apiKey: usuarioLogueado.apiKey,
      idUser: usuarioLogueado.id,
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (
        data &&
        data.codigo === 200 &&
        data.paises &&
        data.paises.length > 0
      ) {
        for (markerPais of markerPaisesPimeados) {
          markerPais.remove();
        }
        marcarPaisesEnMapa(data);
      } else {
        mostrarToast(
          "ERROR",
          "Error",
          "no existe ningun pais con usuarios registrados"
        );
      }
    })
    .catch((error) => console.log(error));
}

/* Toast */
async function mostrarToast(tipo, titulo, mensaje) {
  const toast = document.createElement("ion-toast");
  toast.header = titulo;
  toast.message = mensaje;
  toast.position = "bottom";
  toast.duration = 1000;
  if (tipo === "SUCCESS") {
    toast.color = "success";
  }
  if (tipo === "ERROR") {
    toast.color = "danger";
  }
  if (tipo === "WARNING") {
    toast.color = "warning";
  }

  document.body.appendChild(toast);
  return toast.present();
}
