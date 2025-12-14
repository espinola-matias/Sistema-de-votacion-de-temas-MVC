# 🗳️ Sistema de Votación de Temas (MVC)

![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

Una aplicación web completa desarrollada con **Node.js** y arquitectura **MVC**. Permite a los usuarios crear temas de discusión, compartir enlaces relevantes y votar por el contenido más útil en tiempo real (sin recargar la página).

---

## 📋 Características Principales

* **Arquitectura MVC:** Código organizado limpiamente en Modelos, Vistas y Controladores.
* **CRUD Completo:** Crear, Leer, Actualizar y Eliminar Temas y Enlaces.
* **Sistema de Votos:**
    * Los usuarios pueden votar (upvote) temas y enlaces.
    * **Anti-Spam:** Uso de Cookies/Session ID para evitar votos duplicados.
    * **Ordenamiento Dinámico:** El contenido se reordena automáticamente por votos y novedad.
* **Base de Datos Relacional:** Uso de SQLite3 con claves foráneas y Triggers automáticos para fechas (`updatedAt`).
* **Interfaz Moderna:** Estilizado con TailwindCSS.