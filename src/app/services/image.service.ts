import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly MAX_FILE_SIZE = 1024 * 1024; // 1MB
  private readonly TARGET_FILE_SIZE = 500 * 1024; // 500KB
  private readonly MAX_WIDTH = 1200;
  private readonly QUALITY = 0.7;

  async optimizeImage(file: File): Promise<File | null> {
    // Verificar tamaño inicial
    if (file.size > this.MAX_FILE_SIZE * 2) {
      throw new Error('La imagen es demasiado grande. El tamaño máximo es 2MB');
    }

    // Si la imagen es menor que el tamaño objetivo, devuélvela sin cambios
    if (file.size <= this.TARGET_FILE_SIZE) {
      return file;
    }

    try {
      // Crear una imagen para obtener dimensiones
      const img = await this.createImage(file);
      
      // Calcular nuevas dimensiones manteniendo el aspect ratio
      const dimensions = this.calculateDimensions(img.width, img.height);
      
      // Crear canvas y redimensionar
      const canvas = document.createElement('canvas');
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No se pudo crear el contexto del canvas');
      
      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
      
      // Convertir a blob con calidad reducida
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (b) => resolve(b as Blob),
          file.type,
          this.QUALITY
        );
      });

      // Verificar si el tamaño final es aceptable
      if (blob.size > this.MAX_FILE_SIZE) {
        throw new Error('La imagen sigue siendo demasiado grande después de la optimización');
      }

      // Crear nuevo archivo
      const optimizedFile = new File([blob], file.name, {
        type: file.type,
        lastModified: new Date().getTime()
      });

      return optimizedFile;
    } catch (error) {
      console.error('Error al optimizar la imagen:', error);
      throw error;
    }
  }

  private createImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private calculateDimensions(width: number, height: number) {
    if (width <= this.MAX_WIDTH) {
      return { width, height };
    }

    const ratio = height / width;
    return {
      width: this.MAX_WIDTH,
      height: Math.round(this.MAX_WIDTH * ratio)
    };
  }
} 