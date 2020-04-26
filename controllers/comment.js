'use strict'

var validator = require('validator');
var Topic = require('../models/topic'); 

var controller = {

	add: function(req, res){

		// Recoger el id del topic de la url
		var topicId = req.params.topicId;

		// Find por id del topic
		Topic.findById(topicId).exec((err, topic) => {

			if(err){
				return res.status(500).send({
						status: 'error',
						message: 'Error en la petición'
					});
				}

			if(!topic){
				return res.status(404).send({
						status: 'error',
						message: 'No existe el tema'
					});
				}
				// Comprobar objeto usuario y validar datos
				if(req.body.content){

					//Validar datos
					try{
						var validate_content = !validator.isEmpty(req.body.content);

					}catch (err){
						return res.status(200).send({
							message: 'No has comentado nada'
						});
					}
				}

				if(validate_content){

				var comment = {
					user: req.user.sub,
					content: req.body.content
				}
				// En la propiedad comments del objeto resultante hacer un push
				topic.comments.push(comment);

				// Guardar el topic completo
				topic.save((err) =>{

					if(err){
						return res.status(500).send({
							status: 'error',
							message: 'Error al guardar el comentario'
						});
					}

					//Find por el id del topic -- >> Popular datos en la carga de comentarios
					Topic.findById(topic._id)
						 .populate('user')
						 .populate('comments.user')
						 .exec((err, topic) => {

						 	if(err){
								//Devolver resustado
								return res.status(500).send({
									status: 'error',
									message: 'Error en la petición'
								});				 		
						 	}
						 	if(!topic){
								//Devolver resustado
								return res.status(404).send({
									status: 'error',
									message: 'No existe el tema'
								});				 		
						 	}
						 	//Devolver resustado
								return res.status(200).send({
								status: 'success',
								topic
							});
						 });
					
				});

				}else{
					return res.status(200).send({
							message: 'No se han validado los datos de comentario'
						});
				}

		});

		
	},

	update: function(req, res){

		// Conseguir id de comentario que llega por la url
		var commentId = req.params.commentId;

		// Recoger datos y validar
		var params = req.body;
			//Validar datos
					try{
						var validate_content = !validator.isEmpty(params.content);

					}catch (err){
						return res.status(200).send({
							message: 'No has comentado nada'
						});
					}

		if(validate_content){
		// Find and update de subcomentaio
		Topic.findOneAndUpdate(
			{ "comment._id": commentId },
			{
				"$set": {
					"comments.$.content": params.content
				}
			},
			{new:true},
			(err, topicUpdate) =>{

				if(err){
				return res.status(500).send({
						status: 'error',
						message: 'Error en la petición'
					});
				}

			if(!topicUpdate){
				return res.status(404).send({
						status: 'error',
						message: 'No existe el tema'
					});
				}

				// Devovler datos
		 			return res.status(200).send({
		 				status: 'success',
						topic: topicUpdate
		 			});
			});
		}
	},

	delete: function(req, res){

		// Sacar el id del topic y del  comentario  a borrar
		
		var commentId = req.params.commentId;
		var topicId = req.params.topicId;

		// buscar el topic
		Topic.findById(topicId).exec((err, topic) => {

			if(err){
				return res.status(500).send({
						status: 'error',
						message: 'Error en la petición'
					});
				}

			if(!topic){
				return res.status(404).send({
						status: 'error',
						message: 'No existe el tema-->>',
						topic,
						commentId,
						topicId
					});
				}

				// Seleccionar el subcomentario (comentario)
				var comment =  topic.comment.id(commentId);

				// Borrar el comentario
				if(comment){
					comment.remove();

				// Guardar el topic
				topic.save((err) => {

						if(err){
							return res.status(500).send({
									status: 'error',
									message: 'Error en la petición'
								});
							}
							//Find por el id del topic -- >> Popular datos en la carga de comentarios
							Topic.findById(topic._id)
								 .populate('user')
								 .populate('comments.user')
								 .exec((err, topic) => {

								 	if(err){
										//Devolver resustado
										return res.status(500).send({
											status: 'error',
											message: 'Error en la petición'
										});				 		
								 	}
								 	if(!topic){
										//Devolver resustado
										return res.status(404).send({
											status: 'error',
											message: 'No existe el tema'
										});				 		
								 	}
								 	//Devolver resustado
										return res.status(200).send({
										status: 'success',
										topic
									});
								 });
					});
				}else{
					return res.status(404).send({
						status: 'error',
						message: 'No existe el comentario'
					});
				}

		});

	}
};

module.exports = controller;