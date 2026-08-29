from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(
    title="Product Microservice",
    version="1.0.0"
)

templates = Jinja2Templates(directory="app/templates")

app.mount(
    "/static",
    StaticFiles(directory="app/static"),
    name="static"
)

class Product(BaseModel):
    id: int
    name: str
    price: float


products = [
    Product(id=1, name="Laptop", price=75000),
    Product(id=2, name="Mobile", price=30000),
    Product(id=3, name="Headphones", price=5000),
]


# -------------------------
# HTML Pages
# -------------------------

@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "products": products
        }
    )


@app.get("/products-page", response_class=HTMLResponse)
def products_page(request: Request):
    return templates.TemplateResponse(
        "products.html",
        {
            "request": request,
            "products": products
        }
    )


@app.get("/product/{product_id}", response_class=HTMLResponse)
def product_page(request: Request, product_id: int):

    product = next(
        (product for product in products if product.id == product_id),
        None
    )

    if product is None:
        return HTMLResponse(
            content="<h1>Product Not Found</h1>",
            status_code=404
        )

    return templates.TemplateResponse(
        "product.html",
        {
            "request": request,
            "product": product
        }
    )


# -------------------------
# REST APIs
# -------------------------

@app.get("/api/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/api/products")
def get_products():
    return products


@app.get("/api/products/{product_id}")
def get_product(product_id: int):

    for product in products:
        if product.id == product_id:
            return product

    return {
        "error": "Product not found"
    }