const { mariadb } = require("../options/mariaDB");
const knex = require("knex")(mariadb);

class Product {
    constructor(id, title, price, thumbnail) {
        id = id;
        title = title;
        price = price;
        thumbnail = thumbnail;
    }
}

function createIfNotExist() {
    knex.schema
        .createTable("products", (table) => {
            table.string("title");
            table.string("thumbnail");
            table.float("price");
            table.increments("id");
        })
        .then(() => {
            console.log("Table products created");
        })
        .catch((err) => {
            console.log(err.sqlMessage);
        });
}

function getDataBaseProducts({ field, value }) {
    createIfNotExist();
    if (field && value) {
        return knex.from("products").select("*").where(field, value);
    }
    return knex.from("products").select("*");
}

async function insertProduct({ data }) {
    const res = await knex("products").insert({ ...data });
    return new Product(res[0], data.title, data.price, data.thumbnail);
}

module.exports = { getDataBaseProducts, insertProduct };
