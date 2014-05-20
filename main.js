define(function(require, exports, module) {
	
	var fileInfo = {},
		sideBarColour = $('#sidebar').css('backgroundColor').match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/),
		bgLuminance = luminanace(sideBarColour[1],sideBarColour[2],sideBarColour[3]);

	function addDef(extension, color) {
		fileInfo[extension] = {
			color: color
		};
	}
	function addAlias(extension, other) {
		fileInfo[extension] = fileInfo[other];
	}

	// XML
	addDef('xml',	'#ff6600');
	addDef('html',   '#E34C26');
	addDef('svg',	'#ff9900');

	// Stylesheets
	addDef('css',	'#0270b9');
	addDef('scss',   '#c6538c');
	addAlias('sass',  'scss');
	addDef('less',   '#2b5086');
	addDef('styl',   '#b3d107');

	// JavaScript
	addDef('js',	 '#e5a228');
	addDef('ts',	 '#0074c1');
	addDef('coffee', '#425d99');
	addDef('json',   '#e5a228');

	// Server side
	addDef('php',	'#6976c3');

	// Java
	addDef('java',   '#5382A1');
	addAlias('class', 'java');

	// Shell
	addDef('sh',	 '#008d00');

	// Images
	addDef('png',	'#ff4000');
	addAlias('jpg',   'png');
	addAlias('jpeg',  'png');
	addAlias('tiff',  'png');
	addAlias('ico',   'png');
	addDef('gif',	'#ff4000');

	// Videos
	addDef('mp4',	'#008d00');
	addAlias('webm',  'mp4');
	addAlias('ogg',   'mp4');

	// Audio
	addDef('mp3',	'#921100');
	addAlias('wav',   'mp3');

	// Readme
	addDef('md',	 '#b94700');

	var def = {
		color: '#ddd'
	};

	var ProjectManager = brackets.getModule('project/ProjectManager'),
		DocumentManager = brackets.getModule('document/DocumentManager'),
		ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

	ExtensionUtils.loadStyleSheet(module, "styles/style.css");
	
	function renderFiles() {
		
		$('#project-files-container li>a>.ext-col').remove();
		$('#project-files-container li>a>.extension').show();
		
		var $items = $('#project-files-container li>a');

		$items.each(function(index) {
			var $ext = $(this).find('.extension'),
				ext = ($ext.text() || '').substr(1),
				data;

			if ($(this).parent().hasClass('jstree-leaf')) {
				data = fileInfo.hasOwnProperty(ext) ? fileInfo[ext] : def;
			} else {
				return;
			}

			addColour($ext, ext, data);
		});

	}

	function renderWorkingSet() {
		
		$('#open-files-container li>a>.ext-col').remove();
		$('#open-files-container li>a>.extension').show();

		var $items = $('#open-files-container li>a');

		$items.each(function(index) {
			var $ext = $(this).find('.extension'),
				ext = ($ext.text() || '').substr(1),
				data = fileInfo.hasOwnProperty(ext) ? fileInfo[ext] : def;

			addColour($ext, ext, data);
		});
	}
	
	function addColour($ext, ext, data) {
		
		var $new = $('<span>')
			.text(ext)
			.addClass('ext-col')
			.css({
				color: data.color
			}),
		
			contrast = getContrast50(data.color);
		
		if (contrast === false) {
			$new.css({
				/*backgroundColor: data.color*/
				background: "linear-gradient(to right, rgba(0,0,0,0) 0%, " + data.color + " 100%)"
			})
			.addClass('bg-on');
		}

		$ext.hide();
		$new.insertAfter($ext);
	}
	
	function getContrast50(hexcolor){
		var r = parseInt(hexcolor.substr(1,2),16),
			g = parseInt(hexcolor.substr(3,2),16),
			b = parseInt(hexcolor.substr(5,2),16),
			result = luminanace(r,g,b);
		
		return (result / bgLuminance < 4.5) ? false : true;
	}
	
	function luminanace(r, g, b) {
		var a = [r,g,b].map(function(v) {
			v /= 255;
			return (v <= 0.03928) ?
				v / 12.92 :
				Math.pow( ((v+0.055)/1.055), 2.4 );
			});
		return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
	}

	$(ProjectManager).on('projectOpen projectRefresh', function() {
		var events = 'load_node.jstree create_node.jstree set_text.jstree';

		renderFiles();

		$('#project-files-container').off(events, renderFiles)
									 .on(events, renderFiles);
	});

	$(DocumentManager).on("workingSetAdd workingSetAddList workingSetRemove workingSetRemoveList fileNameChange pathDeleted workingSetSort", function() {
		renderWorkingSet();
	});
});
