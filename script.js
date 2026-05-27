const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const info = document.getElementById('info');
const analyzeBtn = document.getElementById('analyzeBtn');
const dniInput = document.getElementById('dni');
const restructBtn = document.getElementById('restructBtn');
let currentFile = null;

// Solo permitir números en el campo DNI
dniInput.addEventListener('input', () => {
  dniInput.value = dniInput.value.replace(/[^0-9]/g, '');
});

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    currentFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

analyzeBtn.addEventListener('click', () => {
  if (!currentFile) {
    Swal.fire({
    title: "Error",
    text: "Primero selecciona una imagen.",
    icon: "error",
    confirmButtonColor: "#dc3545" // rojo
    });
    return;
  }

  const sizeKB = (currentFile.size / 1024).toFixed(2);
  const extension = currentFile.name.split('.').pop().toLowerCase();

  const img = new Image();
  img.onload = () => {
    const width = img.width;
    const height = img.height;
    const dpi = 96;

    const pesoValido = currentFile.size < 50 * 1024;
    const formatoValido = extension === "jpg" || extension === "jpeg";
    const resolucionValida = (width === 240 && height === 288);

    info.innerHTML = `
      <p><strong>Nombre:</strong> ${currentFile.name}</p>
      <p><strong>Tamaño:</strong> 
        <span class="${pesoValido ? 'ok' : 'error'}">${sizeKB} KB</span>
        ${pesoValido ? '(Correcto)' : '(Debe ser < 50 KB)'}
      </p>
      <p><strong>Formato:</strong> 
        <span class="${formatoValido ? 'ok' : 'error'}">${extension}</span>
        ${formatoValido ? '(Correcto)' : '(Debe ser .jpg)'}
      </p>
      <p><strong>Resolución:</strong> 
        <span class="${resolucionValida ? 'ok' : 'error'}">${width} x ${height}</span>
        ${resolucionValida ? '(Correcto)' : '(Debe ser 240x288)'}
      </p>
    `;
  };
  img.src = URL.createObjectURL(currentFile);
});

// Descargar la imagen con nombre 1_DNI.jpg
 restructBtn.addEventListener('click', () => {
    if (!currentFile) {
      Swal.fire({
      title: "Error",
      text: "Primero selecciona una imagen.",
      icon: "error",
      confirmButtonColor: "#dc3545" // rojo
      });
      return;
    }
    if (!dniInput.value) {
      Swal.fire({
      title: "Error",
      text: "Ingrese su número de DNI.",
      icon: "error",
      confirmButtonColor: "#dc3545" // rojo
      });
      return;
    }

    // Mostrar alerta de confirmación con el DNI
    Swal.fire({
      title: "Confirma tus datos",
      html: `<p>El número de DNI ingresado es:</p>
             <h3>${dniInput.value}</h3>
             <p>Tu número de DNI es correcto?</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "No",
      confirmButtonColor: "#183a79", // azul
      cancelButtonColor: "#dc3545"   // rojo
      
    }).then((result) => {
      if (result.isConfirmed) {
        // ✅ Si acepta, procesar imagen y descargar
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 240;
          canvas.height = 288;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, 240, 288);

          let calidad = 0.9;
          const reducirCalidad = () => {
            canvas.toBlob((blob) => {
              if (blob.size <= 50 * 1024 || calidad <= 0.1) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `1_${dniInput.value}.jpg`;
                link.click();

                // Limpiar datos después de descargar
                fileInput.value = "";
                dniInput.value = "";
                preview.src = "";
                preview.style.display = "none";
                info.innerHTML = "";
                currentFile = null;

                Swal.fire({
                title: "Éxito",
                text: "Imagen reestructurada y descargada correctamente.",
                icon: "success",
                confirmButtonColor: "#28a745" // verde
              });
              } else {
                calidad -= 0.1;
                canvas.toBlob(reducirCalidad, 'image/jpeg', calidad);
              }
            }, 'image/jpeg', calidad);
          };

          reducirCalidad();
        };
        img.src = URL.createObjectURL(currentFile);
      } else {
        // ❌ Si cancela, se mantiene todo igual
        Swal.fire({
        title: "Cancelado",
        text: "Puedes corregir tu número de DNI.",
        icon: "info",
        confirmButtonColor: "#183a79" // azul
        });
      }
    });
  document.querySelector('.menu-item').addEventListener('click', () => {
  window.location.href = 'index.html'; // redirige a tu página principal
});
  });