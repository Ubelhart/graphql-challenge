const express = require("express");
const { Server: HttpServer } = require("http");
const { Server: IOServer } = require("socket.io");
const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const { containerMessages, containerProducts } = require("./Container");
const { getDataBaseProducts, insertProduct } = require("./products");

const schema = buildSchema(`
    type Product {
        id: ID!
        title: String,
        price: Float,
        thumbnail: String
    }
    input ProductInput {
        title: String,
        price: Float,
        thumbnail: String
    }
    type Query {
        getDataBaseProducts(field: String, value: String): [Product]
    }
    type Mutation {
        insertProduct(data: ProductInput): Product
    }
`);

io.on("connection", async (socket) => {
    console.log("Un cliente se ha conectado");
    const messages = await containerMessages.getDataBaseMessages();
    const products = await containerProducts.getDataBaseProducts();

    socket.emit("products", products);
    socket.on("new-products", async (product) => {
        product.price = parseInt(product.price);

        containerProducts.insertProduct(product);
        const products = await containerProducts.getDataBaseProducts();
        io.sockets.emit("products", products);
    });

    socket.emit("messages", messages);
    socket.on("new-message", async (message) => {
        message.date = new Date().toLocaleString();

        containerMessages.insertMessage(message);
        const messages = await containerMessages.getDataBaseMessages();
        io.sockets.emit("messages", messages);
    });
});

app.use(express.static("public"));
app.use(
    "/graphql",
    graphqlHTTP({
        schema: schema,
        rootValue: {
            getDataBaseProducts,
            insertProduct
        },
        graphiql: true
    })
);

app.set("views", "./views");
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("form");
});

module.exports = httpServer;
