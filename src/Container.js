const knex = require("knex");
const { mariadb } = require("../options/mariaDB");
const { sqlite3 } = require("../options/sqlite3");

class Container {
    constructor(config) {
        this.config = config;
        this.knex = knex(config);
    }
}

class Product {
    constructor(id, title, price, thumbnail) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.thumbnail = thumbnail;
    }
}

class ContainerProducts extends Container {
    constructor(config) {
        super(config);
        this.createIfNotExist.bind(this);
        this.getDataBaseProducts.bind(this);
        this.insertProduct.bind(this);
    }

    async createIfNotExist() {
        try {
            await this.knex.schema.createTable("products", (table) => {
                table.string("title");
                table.string("thumbnail");
                table.float("price");
                table.increments("id");
            });
            console.log("Table products created");
        } catch (err) {
            console.log(err.sqlMessage);
        }
    }

    async getDataBaseProducts() {
        await this.createIfNotExist();

        return await this.knex.from("products").select("*");
    }

    insertProduct(product) {
        let newProduct;
        this.knex("products")
            .insert(product)
            .then((res) => {
                newProduct = new Product(
                    res[0],
                    product.title,
                    product.price,
                    product.thumbnail
                );
            });
        return newProduct;
    }
}

class ContainerMessages extends Container {
    constructor(config) {
        super(config);
    }

    async createIfNotExist() {
        try {
            await this.knex.schema.createTable("messages", (table) => {
                table.string("email");
                table.string("text");
                table.string("date");
                table.increments("id");
            });
            console.log("Table messages created");
        } catch (err) {
            console.log(err.sqlMessage);
        }
    }

    async getDataBaseMessages() {
        await this.createIfNotExist();

        let db;
        await this.knex
            .from("messages")
            .select("*")
            .then((messages) => {
                db = messages;
            })
            .catch(async (err) => {
                console.log(err.sqlMessage);
            });
        return db;
    }

    insertMessage(message) {
        this.knex("messages")
            .insert(message)
            .then(() => {
                console.log("Message inserted");
            })
            .catch((err) => {
                console.log(err);
            });
    }
}

const containerMessages = new ContainerMessages(sqlite3);
const containerProducts = new ContainerProducts(mariadb);

module.exports = { containerMessages, containerProducts };
