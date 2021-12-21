import { ModeloAvance } from './avance.js';
import { ProjectModel } from '../proyecto/projecto.js';

const resolversAvance = {
  Query: {
    Avances: async (parent, args) => {
      const avances = await ModeloAvance.find().populate('proyecto').populate('creadoPor');
      return avances;
    },
    detalleAvance: async(parent, args) =>{
      const detalleAvance = await ModeloAvance.findOne({_id: args._id}).populate('proyecto').populate('creadoPor');
      return detalleAvance;
    },
    filtrarAvance: async (parents, args) => {
      const avanceFiltrado = await ModeloAvance.find({ proyecto: args._id })
        .populate('proyecto')
        .populate('creadoPor');
      return avanceFiltrado;
    },
    avanceLider: async (parents, args, context) => {
      const avancesTotales = []
      if (context.userData.rol === 'LIDER') {
        const avances = await ModeloAvance.find().populate('proyecto').populate('creadoPor');
        avances.forEach(avance => {
          if (avance.proyecto.lider.valueOf() === context.userData._id) {
            avancesTotales.push(avance);
          }
        })
        return avancesTotales;
      }
      else if (context.userData.rol === 'ESTUDIANTE') {
        const avances = await ModeloAvance.find({ estudiante: context.userData._id }).populate('proyecto');
        /*.populate('estudiante');*/
        return avances;
      }
    },
  },

  Mutation: {
    crearAvance: async (parents, args) => {

      const avanceCreado = await ModeloAvance.create({
        fecha: args.fecha,
        descripcion: args.descripcion,
        proyecto: args.proyecto,
        creadoPor: args.creadoPor,
      });

      const avances = await ModeloAvance.find({ proyecto: avanceCreado.proyecto });

      if(avances.length === 1){

        const proyectoModificado = await ProjectModel.findOneAndUpdate(
          { _id: avanceCreado.proyecto },
          {
            fase: 'DESARROLLO',
          }
        );
        console.log('proy modificado', proyectoModificado);

      } 
        
      return avanceCreado;
    },
    editarAvance: async (parent, args) => {
      const avanceEditado = await ModeloAvance.findByIdAndUpdate(
        args._id,
        { ...args.campos },
        { new: true }
      );
      return avanceEditado;
    },
    crearObservacion: async (parent, args) =>{
      const avanceModificado = await ModeloAvance.findByIdAndUpdate(
        args._id,
        {
          $addToSet:{
            observaciones: args.observacion,
          }
        },
        { new: true}
      );
      return avanceModificado;
    },    
    editarObservacion: async (parent, args) => {
      console.log("EL ARGUMENTO ESSSS ----", args);
      const avanceModificado = await ModeloAvance.findByIdAndUpdate(
        args._id,
        {
          $set: {
            [`observaciones.${args.indexObservacion}`]:args.observacion,
           
          },
        },
        { new: true }
      );
      return avanceModificado;
    }
  },
};

export { resolversAvance };
