/** @format */

require("dotenv").config();
const Sequelize = require("sequelize");

// set up sequelize to point to our postgres database
let sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);

// define module
const Theme = sequelize.define(
  "Theme",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: Sequelize.STRING,
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

const Set = sequelize.define(
  "Set",
  {
    set_num: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING,
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

Set.belongsTo(Theme, { foreignKey: "theme_id" });
// Theme.hasMany(Set, { foreignKey: "theme_id" });

function initialize() {
  return new Promise(async (resolve, reject) => {
    try {
      await sequelize.sync();
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

const getAllSets = async () => {
  return new Promise((resolve, reject) => {
    Set.findAll({ include: [Theme] })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("No set found");
      });
  });
};

const getSetByNum = async (setNum) => {
  return new Promise((resolve, reject) => {
    Set.findOne({
      where: { set_num: setNum },
      include: [Theme],
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(`No set found with id of ${setNum}`);
      });
  });
};

const getSetsByTheme = async (theme) => {
  return new Promise((resolve, reject) => {
    Set.findAll({
      where: { "$Theme.name$": { [Sequelize.Op.iLike]: `%${theme}%` } },
      include: [Theme],
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(`No set found with theme of ${theme}`);
      });
  });
};

const addSet = async (setData) => {
  return new Promise((resolve, reject) => {
    Set.create(setData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.message);
      });
  });
};

const getAllThemes = async () => {
  return new Promise((resolve, reject) => {
    Theme.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("No theme found");
      });
  });
};

function editSet(setNum, setData) {
  return new Promise((resolve, reject) => {
    Set.update(setData, {
      where: {
        set_num: setNum,
      },
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.message);
      });
  });
}


function deleteSet(setNum) {
  return new Promise((resolve, reject) => {
    Set.destroy({
      where: {
        set_num: setNum,
      },
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.message);
      });
  });
}

module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  addSet,
  getAllThemes,
  editSet,
  deleteSet,
};

// sequelize
//   .sync()
//   .then( async () => {
//     try {
//       await Theme.bulkCreate(themeData);
//       await Set.bulkCreate(setData);
//       console.log("-----");
//       console.log("data inserted successfully");
//     } catch (err) {
//       console.log("-----");
//       console.log(err.message);
//     }
//     process.exit();
//   })
//   .catch((err) => {
//     console.log('Unable to connect to the database:', err);
//   });
