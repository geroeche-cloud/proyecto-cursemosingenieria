/**
 * Centro de colaboración. Cada perfil tiene su propio recorrido y su propio
 * email pre-cargado (asunto + cuerpo natural). El usuario solo completa espacios.
 */

export type Track = {
  id: string;
  label: string;
  headline: string;
  body: string;
  cta: string;
  mailSubject: string;
  mailBody: string;
};

export const TRACKS: Track[] = [
  {
    id: "empresas",
    label: "Empresas",
    headline: "Construyamos algo con impacto real",
    body: "Colaboraciones, proyectos conjuntos, difusión de oportunidades y acceso a una comunidad de estudiantes y futuros profesionales de ingeniería.",
    cta: "Contactar como empresa",
    mailSubject: "Colaboración institucional",
    mailBody:
      "Hola Gerónimo,\n\nRepresento a una empresa y me gustaría conocer las posibilidades de colaborar con tus proyectos.\n\nSomos una empresa dedicada a ____________.\n\nNos interesa especialmente colaborar en __________________.\n\nCreemos que podemos aportar mediante __________________.\n\nQuedo a disposición para conversar y conocer más sobre las posibilidades de trabajar juntos.\n\nSaludos.",
  },
  {
    id: "estudiantes",
    label: "Estudiantes",
    headline: "Sumate y crecé con la comunidad",
    body: "Recursos, acompañamiento y una comunidad para transitar la carrera. El punto de entrada es Cursemos Ingeniería.",
    cta: "Contactar como estudiante",
    mailSubject: "Quiero colaborar como estudiante",
    mailBody:
      "Hola Gerónimo,\n\nSoy estudiante y me gustaría participar en alguno de tus proyectos.\n\nActualmente estudio __________________.\n\nMe interesa especialmente __________________.\n\nCreo que podría aportar en __________________.\n\nQuedo atento para conversar.\n\nSaludos.",
  },
  {
    id: "profesionales",
    label: "Profesionales",
    headline: "Aportá experiencia al ecosistema",
    body: "Compartí tu recorrido, participá en proyectos o abrí puertas a estudiantes que están empezando.",
    cta: "Contactar como profesional",
    mailSubject: "Quiero colaborar profesionalmente",
    mailBody:
      "Hola Gerónimo,\n\nSoy profesional y me gustaría colaborar con alguno de tus proyectos.\n\nTrabajo en el área de __________________.\n\nConsidero que podría aportar principalmente en __________________.\n\nMe interesa conocer cómo podríamos trabajar juntos.\n\nSaludos.",
  },
  {
    id: "docentes",
    label: "Docentes",
    headline: "Multipliquemos el conocimiento",
    body: "Material, contenido y proyectos educativos que lleguen a más estudiantes.",
    cta: "Contactar como docente",
    mailSubject: "Colaboración académica",
    mailBody:
      "Hola Gerónimo,\n\nSoy docente y me gustaría colaborar con alguno de tus proyectos educativos.\n\nCreo que podría aportar mediante __________________.\n\nMe interesa conversar sobre posibles formas de colaboración.\n\nSaludos.",
  },
  {
    id: "investigadores",
    label: "Investigadores",
    headline: "Exploremos problemas de largo plazo",
    body: "Líneas de investigación en energía, tecnología e ingeniería. Ideas que valga la pena resolver.",
    cta: "Contactar como investigador",
    mailSubject: "Colaboración en investigación",
    mailBody:
      "Hola Gerónimo,\n\nTrabajo en investigación y me interesó mucho el enfoque de tus proyectos.\n\nCreo que podría colaborar aportando __________________.\n\nMe gustaría conversar para conocer mejor las posibilidades.\n\nSaludos.",
  },
  {
    id: "mentores",
    label: "Mentores",
    headline: "Acompañá la construcción",
    body: "Mentoría estratégica o técnica para tomar mejores decisiones y evitar errores evitables.",
    cta: "Contactar como mentor",
    mailSubject: "Quiero colaborar como mentor",
    mailBody:
      "Hola Gerónimo,\n\nMe gustaría participar como mentor y acompañar alguno de tus proyectos.\n\nCreo que mi experiencia puede aportar especialmente en __________________.\n\nSi te parece interesante, me encantaría conversar.\n\nSaludos.",
  },
  {
    id: "sponsors",
    label: "Sponsors",
    headline: "Impulsá proyectos con propósito",
    body: "Apoyá iniciativas de educación y tecnología con impacto documentado y transparente.",
    cta: "Contactar como sponsor",
    mailSubject: "Interés en apoyar tus proyectos",
    mailBody:
      "Hola Gerónimo,\n\nMe gustaría conocer las posibilidades de apoyar alguno de tus proyectos.\n\nCreo que podríamos generar una colaboración beneficiosa para ambas partes.\n\nSi te parece, podemos coordinar una reunión para conversar.\n\nSaludos.",
  },
  {
    id: "desarrolladores",
    label: "Desarrolladores",
    headline: "Construyamos producto juntos",
    body: "Sumate a las herramientas y plataformas del ecosistema. Código limpio, escalable y con visión.",
    cta: "Contactar como desarrollador",
    mailSubject: "Quiero colaborar como desarrollador",
    mailBody:
      "Hola Gerónimo,\n\nSoy desarrollador y me gustaría colaborar con alguno de tus proyectos.\n\nTengo experiencia trabajando con __________________.\n\nCreo que podría aportar especialmente en __________________.\n\nMe interesaría conocer cómo podríamos trabajar juntos.\n\nSaludos.",
  },
  {
    id: "disenadores",
    label: "Diseñadores",
    headline: "Diseñemos una identidad atemporal",
    body: "Producto, marca y experiencia. Detalle, sobriedad y calidad de estudio.",
    cta: "Contactar como diseñador",
    mailSubject: "Quiero colaborar como diseñador",
    mailBody:
      "Hola Gerónimo,\n\nSoy diseñador y me gustaría colaborar con alguno de tus proyectos.\n\nMe especializo en __________________.\n\nCreo que puedo aportar mejorando __________________.\n\nMe gustaría conversar sobre posibles formas de colaboración.\n\nSaludos.",
  },
];
