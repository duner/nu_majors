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
		}

	});

	// Dependencies
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');
	
	//Run
	grunt.registerTask('default', ['sass'])
	
};
