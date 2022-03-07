const req = require('express/lib/request');
const fs = require('fs');
const path = require('path')

function get_next_id(data_base){
    //devuelve el proximo id de producto a crear
    return ((data_base.slice(-1))[0].prod_id)+1
}
function agregarProducto(newProduct){
    //read DB
    dataBasePath = path.join(__dirname, '../data_base/productos.json')
    data_base = fs.readFileSync(dataBasePath)
    data_base = JSON.parse(data_base)
    // Generate id and Add new Product
    newProduct["prod_id"] = get_next_id(data_base)
    data_base.push(newProduct)
    //Store DB
    data_base = JSON.stringify(data_base, null, 4) //por formato
    fs.writeFileSync( dataBasePath, data_base, "utf8" )
    return newProduct["prod_id"]
}

function allDataBase (){
    dataBasePath = path.join(__dirname, '../data_base/productos.json');
    data_base = fs.readFileSync((dataBasePath), "utf-8");
    data_base = JSON.parse(data_base);
    return data_base;
}

function writeFile (array){
    dataBasePath = path.join(__dirname, '../data_base/productos.json');
    dataBase = JSON.stringify (array, null, 4);
    fs.writeFileSync (dataBasePath, dataBase );
}

const controller = {
    login: function(req, res){
        res.render("adminLogin")
    },
    controlPanel:function(req, res){
        let results = allDataBase();
        res.render("adminControlPanel", {results: results})
    },
    products:function(req, res){
        dataBasePath = path.join(__dirname, '../data_base/productos.json')
        data_base = fs.readFileSync(dataBasePath)
        data_base = JSON.parse(data_base)
        res.render("products_galery", {'results': data_base})
    },
    addProduct: function(req, res){
        res.render("adminProdCreation", {mesage:null})
    },

    manageProductEdit: function(req, res){
        //obtengo la información
        let products = allDataBase ()
        let productFound = products.find (function(product){
        return product.prod_id == req.params.id
        })
        console.log (productFound);
        res.render ("adminProdModification", {product: productFound}); 
        },

    manageProductUpdate: function (req,res){
        
        let products = allDataBase ();
        let productFound = products.find (function (product){
        return product.prod_id== req.params.id 
            })
        
            productFound.prod_name= req.body.prodName
            productFound.prod_category=req.body.categoria 
            productFound.most_sold = req.body.mostSold == "on" ? "true" : "false"
            productFound.selection = req.body.selection == "on" ? "true" : "false"
            productFound.offer = req.body.offer == "on" ? "true" : "false"
            productFound.prod_img=req.file.filename
            productFound.price=req.body.price
            productFound.price_dto= req.body.price * (100- req.body.dto)/100
            productFound.dto=req.body.dto
            productFound.descripcion=req.body.description
            
            writeFile (products);
            
            res.redirect ('/products/'+ String (productFound.prod_id));
        },


    addProductPost: function(req, res){     
        if (req.file != undefined) {
            //creo objeto del producto nuevo
            newProduct = {
                prod_name: req.body.prodName,
                prod_category: req.body.categoria,
                most_sold: req.body.mostSold || "false",
                selection: req.body.selection || "false",
                offer: req.body.offer || "false",
                prod_img: req.file.filename,
                price: req.body.price,
                price_dto: req.body.price * (100- req.body.dto)/100,
                dto: req.body.dto
            },
            prod_id = agregarProducto(newProduct)
            res.redirect("/products/"+ String(prod_id));
        }else{
            res.render("adminProdCreation", {mesage: "La imagen no ha sido cargada correctamente"})
        }
    },
    
    delete: (req, res) => {
		let products = allDataBase();

		let productIndex = products.findIndex(function(product){
			return product.prod_id == req.params.id
		})

		products.splice(productIndex, 1)

		writeFile(products)

		res.redirect('/admin/ControlPanel')
	}

}

module.exports = controller
