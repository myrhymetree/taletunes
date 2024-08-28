class audiobookDTO {
    id;
    title;
    path; 
    fileName;
    
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.path = data.path;
        this.fileName = data.file;
    }
}

export default audiobookDTO;