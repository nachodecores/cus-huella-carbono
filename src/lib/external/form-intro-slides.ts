export type FormIntroSlide = {
  title: string;
  /** Segunda línea (p. ej. subtítulo en la primera diapositiva). */
  subtitle?: string;
  /** Párrafo principal; omitir si solo aplica título/subtítulo. */
  body?: string;
};

export const FORM_INTRO_SLIDES: FormIntroSlide[] = [
  {
    title: "Introducción a la Encuesta de Relevamiento Agronómico",
    subtitle:
      "Proyecto Uruguay Seeds – Determinación de Huella de Carbono",
  },
  {
    title: "¿Para qué sirve esta encuesta?",
    body: "Esta encuesta es parte de un proyecto de la Cámara Uruguaya de Semillas (CUS) que busca determinar la huella de carbono de las principales semillas producidas en Uruguay. El objetivo es contar con datos concretos que permitan demostrar el impacto ambiental real del sector ante mercados internacionales cada vez más exigentes en materia de sostenibilidad.",
  },
  {
    title: "¿Qué necesitamos saber?",
    body: "La huella de carbono tiene dos caras: lo que se emite (uso de combustibles, fertilizantes, agroquímicos, laboreo) y lo que se captura o reserva (materia orgánica, coberturas, rotaciones). Esta encuesta releva ambas, y está organizada en dos etapas en ese orden.",
  },
  {
    title: "¿Cómo responder?",
    body: "No se le pedirá información lote por lote. Describa las prácticas promedio que aplica para cada especie a lo largo de un ciclo productivo típico. Si hay variaciones relevantes entre años o zonas, puede indicarlas en las observaciones.",
  },
  {
    title: "Confidencialidad",
    body: "Toda la información será tratada de forma estrictamente confidencial y los resultados se presentarán siempre de manera agregada, sin identificar a las empresas individualmente.",
  },
  {
    title: "",
    body: "Tiempo estimado: 20 minutos por especie.",
  },
];
