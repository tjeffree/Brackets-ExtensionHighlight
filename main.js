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
    addDef('xml',       '#ff6600');
    addDef('html',      '#E34C26');
    addAlias('htm',     'html');

    // Stylesheets
    addDef('css',       '#0270b9');
    addDef('scss',      '#c6538c');
    addAlias('sass',    'scss');
    addDef('less',      '#2b5086');
    addDef('styl',      '#b3d107');

    // JavaScript
    addDef('js',        '#e5a228');
    addDef('ts',        '#0074c1');
    addDef('coffee',    '#425d99');
    addAlias('eco',     'coffee');
    addDef('json',      '#e5a228');
    addDef('ls',        '#369bd7');

    // Server side
    addDef('php',       '#6976c3');

    // Java
    addDef('java',      '#5382A1');
    addAlias('class',   'java');

    // Shell
    addDef('sh',        '#008d00');
    addDef('bat',       '#60c910');

    // Images
    addDef('png',       '#ff4000');
    addAlias('jpg',     'png');
    addAlias('jpeg',    'png');
    addAlias('tiff',    'png');
    addAlias('ico',     'png');
    addDef('gif',       '#ff4000');
    addDef('svg',       '#ff9900');

    // Videos
    addDef('mp4',       '#008d00');
    addAlias('webm',    'mp4');
    addAlias('ogg',     'mp4');

    // Audio
    addDef('mp3',       '#921100');
    addAlias('wav',     'mp3');

    // Readme
    addDef('md',        '#b94700');
    addAlias('markdown','md');
    
    // Templating
    addDef('jade',      '#00a86b');
    
    // Git
    addDef('gitignore', '#f64d27');
    addDef('gitmodules','#f64d27');
    
    // Fonts
    addDef('ttf',       '#b42950');
    addAlias('eot',     'ttf');
    addAlias('woff',    'ttf');
    
    // Webservers
    addDef('htaccess',  '#e41a54');
    addDef('htpasswd',  '#6c369c');
    addDef('conf',      '#009900');
    
    // Puppet
    addDef('pp',        '#7761A7');
    
    // SQL
    addDef('sql',       '#008DBB');
    
    // Archives
    addDef('zip',       '#008858');
    addAlias('rar',     'zip');
    addAlias('7z' ,     'zip');
    addAlias('tgz',     'zip');
    addAlias('tar',     'zip');
    addAlias('gz' ,     'zip');
    addAlias('bzip',    'zip');
    
    // Other text files
    addDef('txt',       '#4192c1');
    addDef('log',       '#225dc9');
    addDef('npmignore', '#cb3837');
    addDef('yml',       '#008000');
    addAlias('yaml',    'yml');
    
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
            x = 0, 
            extLen = allExt.length,
            data;
        
        if (extLen === 0) {
            return;
        }
        
        for (;x<extLen;x++) {
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
