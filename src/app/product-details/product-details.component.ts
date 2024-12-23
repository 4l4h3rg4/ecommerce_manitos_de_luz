import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { Product } from 'src/app/interfaces/product.interface';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  product: Product = {
    id: 0,
    name: '',
    price: 0,
    description: '',
    stock: 0,
    image_url: ''
  };
  error: string | null = null;

  constructor(private route: ActivatedRoute, private productService: SupabaseService) {}

  ngOnInit() {
    const productName = this.route.snapshot.paramMap.get('productName');
    if (productName) {
      this.productService.getProductByName(productName).then((data: Product) => {
        this.product = data;
      }).catch(error => {
        this.error = 'Error al obtener el producto: ' + error.message;
        console.error('Error al obtener el producto:', error);
      });
    }
  }

  addToCart(product: Product) {
    console.log('Producto añadido al carrito:', product);
  }
}