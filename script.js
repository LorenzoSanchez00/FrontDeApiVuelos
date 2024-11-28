const API_URL = 'https://localhost:7069/api';
        let vuelos = [];
        let aerolineas = [];
        let ordenAscendente = true;
        let currentPage = 1;
        const itemsPerPage = 10;

        const vueloForm = document.getElementById('vueloForm');
        const aerolineaForm = document.getElementById('aerolineaForm');
        const vuelosTable = document.getElementById('vuelosTable');
        const aerolineasTable = document.getElementById('aerolineasTable');
        const ordenarPrecioBtn = document.getElementById('ordenarPrecio');
        const editModal = document.getElementById('editModal');
        const editVueloForm = document.getElementById('editVueloForm');
        const closeModal = document.getElementsByClassName('close')[0];
        const filtroAerolinea = document.getElementById('filtroAerolinea');
        const filtroClase = document.getElementById('filtroClase');
        const aplicarFiltrosBtn = document.getElementById('aplicarFiltros');
        const prevPageBtn = document.getElementById('prevPage');
        const nextPageBtn = document.getElementById('nextPage');
        const currentPageSpan = document.getElementById('currentPage');

        vueloForm.addEventListener('submit', agregarVuelo);
        aerolineaForm.addEventListener('submit', agregarAerolinea);
        ordenarPrecioBtn.addEventListener('click', ordenarVuelosPorPrecio);
        editVueloForm.addEventListener('submit', guardarCambiosVuelo);
        closeModal.onclick = () => editModal.style.display = "none";
        window.onclick = (event) => {
            if (event.target == editModal) {
                editModal.style.display = "none";
            }
        };
        aplicarFiltrosBtn.addEventListener('click', aplicarFiltros);
        prevPageBtn.addEventListener('click', () => cambiarPagina(-1));
        nextPageBtn.addEventListener('click', () => cambiarPagina(1));

        async function cargarVuelos() {
            try {
                const response = await fetch(`${API_URL}/Vuelos`);
                vuelos = await response.json();
                actualizarTablaVuelos();
            } catch (error) {
                console.error('Error al cargar vuelos:', error);
            }
        }

        async function cargarAerolineas() {
            try {
                const response = await fetch(`${API_URL}/Aerolinea`);
                aerolineas = await response.json();
                actualizarTablaAerolineas();
                actualizarSelectAerolineas();
            } catch (error) {
                console.error('Error al cargar aerolíneas:', error);
            }
        }

        async function agregarVuelo(e) {
            e.preventDefault();
            if (validarFormularioVuelo()) {
                const nuevoVuelo = {
                    origen: document.getElementById('origen').value,
                    destino: document.getElementById('destino').value,
                    fechaIda: document.getElementById('fechaIda').value,
                    fechaVuelta: document.getElementById('fechaVuelta').value,
                    precio: parseFloat(document.getElementById('precio').value),
                    idAerolinea: document.getElementById('idAerolinea').value,
                    clase: document.getElementById('clase').value
                };
                try {
                    const response = await fetch(`${API_URL}/Vuelos`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(nuevoVuelo),
                    });
                    if (response.ok) {
                        await cargarVuelos();
                        vueloForm.reset();
                    } else {
                        console.error('Error al agregar vuelo');
                    }
                } catch (error) {
                    console.error('Error al agregar vuelo:', error);
                }
            }
        }

        async function agregarAerolinea(e) {
            e.preventDefault();
            if (validarFormularioAerolinea()) {
                const nuevaAerolinea = {
                    nombre: document.getElementById('nombreAerolinea').value
                };
                try {
                    const response = await fetch(`${API_URL}/Aerolinea`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(nuevaAerolinea),
                    });
                    if (response.ok) {
                        await cargarAerolineas();
                        aerolineaForm.reset();
                    } else {
                        console.error('Error al agregar aerolínea');
                    }
                } catch (error) {
                    console.error('Error al agregar aerolínea:', error);
                }
            }
        }

        async function eliminarVuelo(id) {
            try {
                const response = await fetch(`${API_URL}/Vuelos/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    await cargarVuelos();
                } else {
                    console.error('Error al eliminar vuelo');
                }
            } catch (error) {
                console.error('Error al eliminar vuelo:', error);
            }
        }

        async function eliminarAerolinea(id) {
            try {
                const response = await fetch(`${API_URL}/Aerolinea/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    await cargarAerolineas();
                } else {
                    console.error('Error al eliminar aerolínea');
                }
            } catch (error) {
                console.error('Error al eliminar aerolínea:', error);
            }
        }

        function actualizarTablaVuelos() {
            const tbody = vuelosTable.querySelector('tbody');
            tbody.innerHTML = '';
            const vuelosFiltrados = filtrarVuelos();
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const vuelosPaginados = vuelosFiltrados.slice(start, end);
            vuelosPaginados.forEach(vuelo => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${vuelo.idVuelo}</td>
                    <td>${vuelo.origen}</td>
                    <td>${vuelo.destino}</td>
                    <td>${vuelo.fechaIda}</td>
                    <td>${vuelo.fechaVuelta || 'N/A'}</td>
                    <td>$${vuelo.precio.toFixed(2)}</td>
                    <td>${aerolineas.find(a => a.idAerolinea === vuelo.idAerolinea)?.nombre || 'Desconocida'}</td>
                    <td>${vuelo.clase}</td>
                    <td>
                        <button onclick="editarVuelo(${vuelo.idVuelo})">Editar</button>
                        <button onclick="eliminarVuelo(${vuelo.idVuelo})">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            actualizarPaginacion(vuelosFiltrados.length);
        }

        function actualizarTablaAerolineas() {
            const tbody = aerolineasTable.querySelector('tbody');
            tbody.innerHTML = '';
            aerolineas.forEach(aerolinea => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${aerolinea.idAerolinea}</td>
                    <td>${aerolinea.nombre}</td>
                    <td><button onclick="eliminarAerolinea(${aerolinea.idAerolinea})">Eliminar</button></td>
                `;
                tbody.appendChild(tr);
            });
        }

        function ordenarVuelosPorPrecio() {
            ordenAscendente = !ordenAscendente;
            vuelos.sort((a, b) => ordenAscendente ? a.precio - b.precio : b.precio - a.precio);
            actualizarTablaVuelos();
        }

        async function editarVuelo(id) {
            try {
                const response = await fetch(`${API_URL}/Vuelos/${id}`);
                const vuelo = await response.json();
                if (vuelo) {
                    document.getElementById('editId').value = vuelo.idVuelo;
                    document.getElementById('editOrigen').value = vuelo.origen;
                    document.getElementById('editDestino').value = vuelo.destino;
                    document.getElementById('editFechaIda').value = vuelo.fechaIda;
                    document.getElementById('editFechaVuelta').value = vuelo.fechaVuelta || '';
                    document.getElementById('editPrecio').value = vuelo.precio;
                    document.getElementById('editAerolinea').value = vuelo.idAerolinea;
                    document.getElementById('editClase').value = vuelo.clase;
                    editModal.style.display = "block";
                }
            } catch (error) {
                console.error('Error al cargar vuelo para editar:', error);
            }
        }

        async function guardarCambiosVuelo(e) {
            e.preventDefault();
            if (validarFormularioEditVuelo()) {
                const id = document.getElementById('editId').value;
                const vueloEditado = {
                    idVuelo: id,
                    origen: document.getElementById('editOrigen').value,
                    destino: document.getElementById('editDestino').value,
                    fechaIda: document.getElementById('editFechaIda').value,
                    fechaVuelta: document.getElementById('editFechaVuelta').value,
                    precio: parseFloat(document.getElementById('editPrecio').value),
                    idAerolinea: document.getElementById('editAerolinea').value,
                    clase: document.getElementById('editClase').value
                };
                try {
                    const response = await fetch(`${API_URL}/Vuelos/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(vueloEditado),
                    });
                    if (response.ok) {
                        await cargarVuelos();
                        editModal.style.display = "none";
                    } else {
                        console.error('Error al actualizar vuelo');
                    }
                } catch (error) {
                    console.error('Error al actualizar vuelo:', error);
                }
            }
        }

        function actualizarSelectAerolineas() {
            const selectAerolinea = document.getElementById('idAerolinea');
            const editSelectAerolinea = document.getElementById('editAerolinea');
            const filtroAerolinea = document.getElementById('filtroAerolinea');
            const options = '<option value="">Seleccionar Aerolínea</option>' + 
                aerolineas.map(a => `<option value="${a.idAerolinea}">${a.nombre}</option>`).join('');
            selectAerolinea.innerHTML = options;
            editSelectAerolinea.innerHTML = options;
            filtroAerolinea.innerHTML = '<option value="">Todas las Aerolíneas</option>' + options;
        }

        function validarFormularioVuelo() {
            let isValid = true;
            isValid = validarCampo('origen', 'origenError', 'El origen es requerido') && isValid;
            isValid = validarCampo('destino', 'destinoError', 'El destino es requerido') && isValid;
            isValid = validarCampo('fechaIda', 'fechaIdaError', 'La fecha de ida es requerida') && isValid;
            isValid = validarCampo('precio', 'precioError', 'El precio es requerido') && isValid;
            isValid = validarCampo('idAerolinea', 'aerolineaError', 'La aerolínea es requerida') && isValid;
            isValid = validarCampo('clase', 'claseError', 'La clase es requerida') && isValid;
            return isValid;
        }

        function validarFormularioEditVuelo() {
            let isValid = true;
            isValid = validarCampo('editOrigen', 'editOrigenError', 'El origen es requerido') && isValid;
            isValid = validarCampo('editDestino', 'editDestinoError', 'El destino es requerido') && isValid;
            isValid = validarCampo('editFechaIda', 'editFechaIdaError', 'La fecha de ida es requerida') && isValid;
            isValid = validarCampo('editPrecio', 'editPrecioError', 'El precio es requerido') && isValid;
            isValid = validarCampo('editAerolinea', 'editAerolineaError', 'La aerolínea es requerida') && isValid;
            isValid = validarCampo('editClase', 'editClaseError', 'La clase es requerida') && isValid;
            return isValid;
        }

        function validarFormularioAerolinea() {
            return validarCampo('nombreAerolinea', 'nombreAerolineaError', 'El nombre de la aerolínea es requerido');
        }

        function validarCampo(inputId, errorId, errorMessage) {
            const input = document.getElementById(inputId);
            const error = document.getElementById(errorId);
            if (!input.value.trim()) {
                error.textContent = errorMessage;
                return false;
            } else {
                error.textContent = '';
                return true;
            }
        }

        function filtrarVuelos() {
            const aerolineaFiltro = filtroAerolinea.value;
            const claseFiltro = filtroClase.value;
            return vuelos.filter(vuelo => 
                (!aerolineaFiltro || vuelo.idAerolinea === aerolineaFiltro) &&
                (!claseFiltro || vuelo.clase === claseFiltro)
            );
        }

        function aplicarFiltros() {
            currentPage = 1;
            actualizarTablaVuelos();
        }

        function actualizarPaginacion(totalItems) {
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            prevPageBtn.disabled = currentPage === 1;
            nextPageBtn.disabled = currentPage === totalPages;
            currentPageSpan.textContent = `Página ${currentPage} de ${totalPages}`;
        }

        function cambiarPagina(delta) {
            currentPage += delta;
            actualizarTablaVuelos();
        }

        // Inicialización
        cargarVuelos();
        cargarAerolineas();