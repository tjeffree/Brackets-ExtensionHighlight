define(function(require, exports, module) {
	
	var fileInfo = {},
		sideBarColour = $('#sidebar').css('backgroundColor').match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/),
		bgLuminance = luminanace(sideBarColour[1],sideBarColour[2],sideBarColour[3]),
		constrastCache = {}

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
	addAlias('htm',  'html');
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
	addAlias('eco','coffee');
	addDef('json',   '#e5a228');
	addDef('ls',     '#369bd7');

	// Server side
	addDef('php',	'#6976c3');

	// Java
	addDef('java',   '#5382A1');
	addAlias('class', 'java');

	// Shell
	addDef('sh',	 '#008d00');
	addDef('bat',	 '#60c910');

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
	
	// Templating
	addDef('jade',	 '#00a86b');
	
	var def = {
		color: '#ffffff'
	}

	var ProjectManager = brackets.getModule('project/ProjectManager'),
		DocumentManager = brackets.getModule('document/DocumentManager'),
		ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

	ExtensionUtils.loadStyleSheet(module, "styles/style.css");
	
	function renderFiles(container, requireLeaf) {
		
		$(container + ' li>a>.ext-col').remove();
		$(container + ' li>a>.extension').show();
		
		[].forEach.call( document.querySelectorAll(container + ' li>a') , function(el) {
			
			if (requireLeaf === true && !el.parentNode.classList.contains('jstree-leaf')) {
				return false;
			}
			
			parseExtension( el.querySelector('.extension') );
		});

	}
	
	function parseExtension(ext) {
		
		if (ext === null) {
			return;
		}
		
		var allExt = ext.innerText.substr(1).split('.'),
			x = allExt.length,
			data;
		
		if (x === 0) {
			return;
		}
		
		while (x--) {
			data = fileInfo.hasOwnProperty(allExt[x]) ? fileInfo[allExt[x]] : def;
			addColour(ext, allExt[x], data);
		}
		
	}
	
	function addColour(oldExt, ext, data) {
		
		var newEle   = document.createElement('span'),
			contrast = getContrast(data.color);
		
		newEle.appendChild(document.createTextNode(ext));
		newEle.className   = 'ext-col';
		newEle.style.color = data.color;
		
		if (contrast === false) {
			newEle.style.background = "linear-gradient(to right, rgba(0,0,0,0) 0%, " + data.color + " 33%)";
			newEle.classList.add('bg-on');
		}
		
		oldExt.style.display = 'none';
		oldExt.parentNode.appendChild(newEle);
		
	}
	
	function getContrast(hexcolor){
		
		if (!(hexcolor in constrastCache)) {
		
			var r = parseInt(hexcolor.substr(1,2),16),
				g = parseInt(hexcolor.substr(3,2),16),
				b = parseInt(hexcolor.substr(5,2),16),
				result = luminanace(r,g,b);

			constrastCache[hexcolor] = (result / bgLuminance < 3) ? false : true;
		
		}
		
		return constrastCache[hexcolor];
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
		
		function doRender() {
			renderFiles('#project-files-container', true);
		}
		
		doRender();

		$('#project-files-container').off(events, doRender)
									 .on(events, doRender);
	});

	$(DocumentManager).on("workingSetAdd workingSetAddList workingSetRemove workingSetRemoveList fileNameChange pathDeleted workingSetSort", function() {
		renderFiles('#open-files-container');
	});
});
