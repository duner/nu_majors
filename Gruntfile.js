module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
	
		sass: {
			dist: {
				options: {
					style: 'compressed'
				},
				files: {
					'_css/styles.css': '_css/scss/styles.scss',
				}
			}
		},

		watch: {
			css: {
			    files: ['_css/*.scss'],
			    tasks: ['sass'],
			    options: {	
			        spawn: false,
			    }
			}
		},

		uglify: {
    		build: {
		        src: '_js/script.js',
		        dest: '_js/script.min.js'
    		}
		}

	});

	// Dependencies
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	
	//Run
	grunt.registerTask('default', ['sass', 'uglify'])
	
};
