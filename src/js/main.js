function Challeh(options) {
    let defaultOptions = {
        inputName: 'challeh-files',
        container: '.container',
        multiple: true,
        maxFileSize: 5990859, //bytes
        attachments: [],
    }
    const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png']
    const DEFAULT_IMAGE_PATH = 'src/images/file.png'

    options = {...defaultOptions, ...options}
    const classNames = {
        dropzone: 'challeh',
        dropzoneOuter: 'challeh-outer',
        input: 'challeh-input',
        imgBlock: 'challeh-img-block',
        caption: 'challeh-caption',
        img: 'challeh-img',
        cover: 'challeh-cover',
        coverOuter: 'challeh-cover-outer',
    }

    let attachments = options.attachments
    let _this = this
    let fileList = []

    this.init = function () {

        /***** create dropZoneOuter *****/
        let dropZoneOuter = document.createElement('div')
        dropZoneOuter.setAttribute('class', classNames.dropzoneOuter)
        _this.dropZoneOuter = dropZoneOuter

        /***** create dropZone  *****/
        let dropZone = document.createElement('div')
        dropZone.setAttribute('class', classNames.dropzone)
        _this.dropZoneElm = dropZone

        /***** create file input  *****/
        let input = document.createElement('input')
        input.setAttribute('name', options.inputName)
        input.setAttribute('type', 'file')
        input.setAttribute('multiple', options.multiple)
        input.setAttribute('class', classNames.input)
        _this.input = input
        if (options.multiple === true) {
            input.setAttribute('name', options.inputName + "[]")

        }

        /***** append file input and dropzone to dropZoneOuter  *****/
        dropZoneOuter.appendChild(input)
        dropZoneOuter.appendChild(dropZone)

        /***** append dropZoneOuter to container  *****/
        let container = document.querySelector(options.container);
        container.innerHTML = ""
        container.appendChild(dropZoneOuter)


        if (attachments.length > 0) {
            _this.getImageBlob(attachments)
        }

        /***** assign file input click event to dropzone  *****/
        dropZone.addEventListener('click', function (event) {
            if (event.target !== this)
                return;
            input.click()
        })

        /***** add event listener to file input when changed ( file is selected ) *****/
        input.addEventListener('change', function () {
            _this.inputChanged(this)
        })
    }

    this.inputChanged = function (input) {

        let files = input.files
        for (let i = 0; i < files.length; i++) {
            let reader = new FileReader();
            let file = input.files[i]

            /***** pass all selected file to input *****/
            fileList.push(file); //push file to files list array to send to the server
            input.files = _this.createFileList(fileList)

            /***** validate selected file *****/
            if (file.size > options.maxFileSize) {
                alert('maximum file size is ' + _this.humanFileSize(options.maxFileSize))
                return;
            }

            /***** create image block for selected file *****/
            reader.readAsDataURL(file);
            reader.onload = function (e) {
                let src = e.target.result;
                _this.createImageBlock(
                    {
                        isNew: true,
                        src: src,
                        name: file.name,
                        size: file.size,
                        type: file.type
                    })
            };
        }
     }

    this.createImageBlock = function (data) {

        let fromInput = !!data.isNew
        let size = _this.humanFileSize(data.size)

        /***** create image block *****/
        let imgBlock = document.createElement('div')
        imgBlock.setAttribute('class', classNames.imgBlock)
        imgBlock.setAttribute('data-file', data.name)

        if (!fromInput) {
            imgBlock.setAttribute('data-attachment-id', data.id)
        }
        _this.dropZoneElm.appendChild(imgBlock)

        /***** create cover *****/
        let cover = document.createElement('div')
        cover.setAttribute('class', classNames.cover)
        cover.innerHTML = data.name + "<br>" + size
        let coverOuter = document.createElement('div')
        coverOuter.setAttribute('class', classNames.coverOuter)
        coverOuter.appendChild(cover)
        imgBlock.appendChild(coverOuter)

        /***** create image *****/
        let img = document.createElement('img')
        img.setAttribute('src', (VALID_IMAGE_TYPES.includes(data.type)) ? data.src : DEFAULT_IMAGE_PATH)
        img.setAttribute('class', classNames.img)
        imgBlock.appendChild(img)

        /***** create captions *****/
        let caption = document.createElement('div')
        caption.setAttribute('class', classNames.caption)
        imgBlock.appendChild(caption)

        /***** create remove button and append to caption *****/
        let removeElm = document.createElement('span')
        removeElm.setAttribute('data-toggle', 'remove')
        removeElm.innerText = 'remove'
        removeElm.style.marginRight = '5px'
        removeElm.addEventListener('click', function () {
            _this.remove(this, fromInput)
        })
        caption.appendChild(removeElm)

        /***** create download button and append to caption *****/
        let downloadElm = document.createElement('a')
        downloadElm.innerText = 'download'
        downloadElm.setAttribute('href', data.src)
        downloadElm.setAttribute('target', '_blank')
        caption.appendChild(downloadElm)

    }

    this.getImageBlob = function (attachments) {
        attachments.forEach(function (attachment) {
            fetch(attachment.url)
                .then(response => response.blob())
                .then(data => {
                    _this.createImageBlock({
                        isNew: false,
                        src: attachment.url,
                        name: attachment.name,
                        size: data.size,
                        type: data.type,
                        id: attachment.id
                    })
                })
        })
    }

    this.remove = function (elm, fromInput) {

        let ImgBlockElm = elm.parentElement.closest("." + classNames.imgBlock)
        name = ImgBlockElm.getAttribute('data-file')
        ImgBlockElm.remove()
        if (fromInput) {
            /***** remove selected files from input *****/
            let input = _this.input
            let filtered = Object.values(input.files).filter(function (value) {
                return (value.name !== name);
            });
            fileList = filtered
            input.files = _this.createFileList(filtered)

        } else {
            /***** create removed_attachments input *****/
            let id = ImgBlockElm.getAttribute('data-attachment-id');
            let input = document.createElement('input')
            input.setAttribute('type', 'hidden')
            input.setAttribute('name', 'removed_attachments[]')
            input.value = id
            _this.dropZoneOuter.appendChild(input)
        }
    }

    this.createFileList = function (fileList) {
        let list = new DataTransfer();
        fileList.forEach(function (value) {
            list.items.add(value)
        })
        return list.files
    }

    this.humanFileSize = function (bytes, si = false, dp = 1) {
        const thresh = si ? 1000 : 1024;

        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }

        const units = si
            ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        let u = -1;
        const r = 10 ** dp;

        do {
            bytes /= thresh;
            ++u;
        } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


        return bytes.toFixed(dp) + ' ' + units[u];
    }

    this.init()

}
