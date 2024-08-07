const { createBot, createProvider, createFlow, addKeyword,EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const WebWhatsappProvider = require('@bot-whatsapp/provider/web-whatsapp')
const MongoAdapter = require('@bot-whatsapp/database/mongo')

const MONGO_DB_URI = 'mongodb+srv://Grupo3:123321@cluster0.xfox8rn.mongodb.net/ChatBot?retryWrites=true&w=majority'
const MONGO_DB_NAME = 'db_bot'

const FlowError = addKeyword(EVENTS.WELCOME).addAnswer('Perdon no te entendi , escribe menu para volver')

const flowCamisa = addKeyword(['camisa', 'manga larga', 'elegante', 'traje', 'blanco', 'blanca', "la camisa"]).addAnswer(
    [
        'Camisa blanca manga larga',
        '\n https://payco.link/2543018',
    ],
);
const flowPantalon = addKeyword(['pantalon', 'campana', 'bota', 'ancha', "el pantalon"]).addAnswer(
    [
        'Pantalon bota ancha',
        "\n https://payco.link/2543162",
    ],
);
const flowVestido = addKeyword(['Vestido', 'Flores', 'el vestido']).addAnswer(
    [
        'Vestido de flores',
        "\n https://payco.link/2543146",
    ],
);

const FlowChatGPTCatalogo = addKeyword("Catalogo", "catàlogo", "catálogo").addAnswer("un momento", null, async (ctx, { flowDynamic }) => {
    const openAI = await import("./ChatGPT.mjs");
    const prompt = "El usuario desea ver el catalogo de nuestros productos , dile de forma ordenada, resumida , corta y precisa que en nuestro catalogo tenemos:Camisas blancas manga larga, pantalones bota ancha y vestidos de flores ademas de cada uno inventa detalles para que el usuario se decida por comprar";
    const text = await openAI.ChatCompletion(prompt)
    await flowDynamic(text);
}).addAnswer(
    [
        '¿Dime cual deseas comprar?',
        '\n Camisa blanca manga larga',
        '\n Pantalón bota ancha',
        "\n Vestido de flores",
        "\n .... + Opciones en proceso",
    ],
    null,
    null,
    [flowPantalon, flowCamisa, flowVestido,FlowError]
);

const FlowChatGPTGeneral = addKeyword("Vender").addAnswer("Estas hablando con nuestro vendedor , escribe tu consulta siempre con un **vender** al principio:").addAnswer("un momento", null, async (ctx, { flowDynamic }) => {
    const openAI = await import("./ChatGPT.mjs");
    const text = await openAI.ChatCompletion(ctx.body);
    await flowDynamic(text);
});

const FlowChatGPTVender = addKeyword("1", "uno").addAnswer("Un momento", null, async (ctx, { flowDynamic }) => {
    const openAI = await import("./ChatGPT.mjs");
    const prompt = "Eres vender , una ia con el rol de vendedor en la empresa EcoModa,responde presentandote con la informacion que te di en un parrafo supercorto y todas tus respuestas deben ser super cortas , serio y profecional dirigiendote al usuario , recuerda siempre evitar responder preguntas o peticiones que no tengan nada que ver con ropa ,tu rol como vendedor o la empresa de la cual si piden informacio te la puedes inventar pero que siempre tenga sentido";
    const text = await openAI.ChatCompletion(prompt)
    await flowDynamic(text)
}).addAnswer(
    [
        'Ahora dime tu consulta:',
        '\n Si tienes una pregunta muy general dime : Vender antes de tu pregunta',
        '\n Si deseas ver nuestros productos dime : Catalogo',
        "\n .... + Opciones en proceso",

    ],
    null,
    null,
    [FlowChatGPTGeneral, FlowChatGPTCatalogo,FlowError]
);

const flowFormulario = addKeyword("Formulario")
    .addAnswer("Hola , gracias por llenar nuestro formulario y permitirnos personalizar mas la atencion que te damos")
    .addAnswer('¿Cual es tu nombre?', { capture: true }, async (ctx, { state }) => {
        await state.update({ nombre: ctx.body })
    })
    .addAnswer('¿Cual es tu telefono?', { capture: true }, async (ctx, { state }) => {
        await state.update({ telefono: ctx.body })
    })
    .addAnswer('¿Cual es tu correo?', { capture: true }, async (ctx, { state }) => {
        await state.update({ correo: ctx.body })
    })
    .addAnswer('¿Cuál es tu direccion?', { capture: true }, async (ctx, { state }) => {
        await state.update({ direccion: ctx.body })
    })
    .addAnswer('¿Cuál es tu codigo postal?', { capture: true }, async (ctx, { state }) => {
        await state.update({ codigoPostal: ctx.body })
    }).addAnswer('¡Gracias por la información!, escirbe menu para volver')

const flowPricipal = addKeyword(["menu", "menù", "menú"]).addAnswer(
    [
        'Menu pricipal: ',
        '\n Si no haz llenado nuestro fomulario escribe : formulario',
        '\n Escibre *1* para hablar con nuestro asesor de ventas',
        '\n .... + Opciones en proceso',
    ],
    null,
    null,
    [FlowChatGPTVender,flowFormulario]
)

const main = async () => {
    const adapterDB = new MongoAdapter({
        dbUri: MONGO_DB_URI,
        dbName: MONGO_DB_NAME,
    })
    const adapterFlow = createFlow([flowPricipal,FlowError])
    const adapterProvider = createProvider(WebWhatsappProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}

main()
