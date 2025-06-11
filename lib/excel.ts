// Función para procesar datos de Excel (simulada)
export const processExcelData = (file: File): Promise<any[]> => {
  return new Promise((resolve) => {
    // Simulamos el procesamiento del archivo Excel
    setTimeout(() => {
      // Datos de ejemplo que simularían venir del Excel
      const excelData = [
        {
          nombre: "Juan Carlos Pérez",
          numero: "+34 600 111 222",
          notas: "Cliente potencial importado desde Excel. Interesado en servicios básicos.",
        },
        {
          nombre: "María Elena Rodríguez",
          numero: "+34 600 333 444",
          notas: "Prospecto de campaña digital. Requiere seguimiento telefónico.",
        },
        {
          nombre: "Antonio García López",
          numero: "+34 600 555 666",
          notas: "Lead generado por marketing. Mostró interés en productos premium.",
        },
        {
          nombre: "Carmen Martínez Silva",
          numero: "+34 600 777 888",
          notas: "Cliente referido por socio comercial. Alta probabilidad de conversión.",
        },
      ]
      resolve(excelData)
    }, 2000) // Simula tiempo de procesamiento
  })
}
