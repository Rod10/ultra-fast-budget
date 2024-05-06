/* eslint-disable max-lines-per-function */
const fs = require("fs");
const webpackConfig = require("./webpack.config.js");

module.exports = grunt => {
  grunt.initConfig({
    babel: {
      options: {
        presets: ["@babel/preset-react"],
        sourceMap: true,
      },
      node: {
        files: [{
          expand: true,
          src: [
            "react/**/*.js",
          ],
          dest: "dist/",
        }],
      },
    },

    webpack: {build: webpackConfig},

    clean: {files: ["dist"]},

    copy: {
      server: {
        src: [
          "package.json",
          ".sequelizerc",
          "./db/**",
          "./express/**",
        ],
        dest: "./dist/",
      },
      public: {
        expand: true,
        src: ["./public/**"],
        cwd: "./webres/",
        dest: "./dist/",
      },
      binDev: {
        expand: true,
        src: ["**"],
        cwd: ".bin/",
        dest: "./dist/",
      },
      configDev: {
        expand: true,
        src: ["config.json"],
        cwd: "./config_exemple/",
        dest: "dist/",
      },
      langs: {
        expand: true,
        src: ["./react/langs/**"],
        dest: "dist",
      },
    },

    watch: {
      server: {
        files: ["express/**"],
        tasks: ["copy:server"],
        options: {spawn: false},
      },
      react: {
        files: ["react/**"],
        tasks: [
          "babel",
          "webpack",
        ],
      },
    },

    usebanner: {
      taskName: {
        options: {
          position: "top",
          banner: fs.readFileSync("./LICENCE"),
          linebreak: true,
        },
        files: {src: ["dist/**/*.js"]},
      },
    },

    less: {development: {files: {"public/css/style.css": "less/style.less"}}},
  });

  grunt.loadNpmTasks("grunt-banner");
  grunt.loadNpmTasks("grunt-babel");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-less");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-webpack");

  grunt.registerTask("base", [
    "clean",
    "copy:server",
    "babel",
    "copy:langs",
    "copy:public",
    "webpack",
  ]);

  grunt.registerTask("deploy", [
    "clean",
    "base",
    "usebanner",
  ]);

  grunt.registerTask("development", [
    "base",
    "copy:binDev",
    "copy:configDev",
  ]);

  grunt.registerTask("default", ["development"]);
};
