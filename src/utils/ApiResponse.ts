class ApiResponse{
    constructor(
        public statusCode:number,
        public message:string,
        public data?:Object
    )
    {
        this.statusCode=statusCode
        this.message=message
        this.data=data
    }
}
export default ApiResponse