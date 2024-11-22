"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApigatewayOpenapiConstruct = void 0;
// import * as cdk from 'aws-cdk-lib';
const constructs_1 = require("constructs");
const open_api_1 = require("./utils/open-api");
class ApigatewayOpenapiConstruct extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        (0, open_api_1.generateOpenApiFile)(props.api, props.schemas);
    }
}
exports.ApigatewayOpenapiConstruct = ApigatewayOpenapiConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9saWIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsc0NBQXNDO0FBQ3RDLDJDQUF1QztBQUN2QywrQ0FBcUU7QUFVckUsTUFBYSwwQkFBMkIsU0FBUSxzQkFBUztJQUN2RCxZQUNFLEtBQWdCLEVBQ2hCLEVBQVUsRUFDVixLQUFzQztRQUV0QyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLElBQUEsOEJBQW1CLEVBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDaEQsQ0FBQztDQUNGO0FBVkQsZ0VBVUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCB7IGdlbmVyYXRlT3BlbkFwaUZpbGUsIFNjaGVtYVBhcmFtcyB9IGZyb20gXCIuL3V0aWxzL29wZW4tYXBpXCI7XG5pbXBvcnQgeyBJUmVzdEFwaSB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheVwiO1xuLy8gaW1wb3J0ICogYXMgc3FzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zcXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFwaWdhdGV3YXlPcGVuYXBpQ29uc3RydWN0UHJvcHMge1xuICAvLyBEZWZpbmUgY29uc3RydWN0IHByb3BlcnRpZXMgaGVyZVxuICBhcGk6IElSZXN0QXBpO1xuICBzY2hlbWFzOiBTY2hlbWFQYXJhbXM7XG59XG5cbmV4cG9ydCBjbGFzcyBBcGlnYXRld2F5T3BlbmFwaUNvbnN0cnVjdCBleHRlbmRzIENvbnN0cnVjdCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHNjb3BlOiBDb25zdHJ1Y3QsXG4gICAgaWQ6IHN0cmluZyxcbiAgICBwcm9wczogQXBpZ2F0ZXdheU9wZW5hcGlDb25zdHJ1Y3RQcm9wc1xuICApIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgZ2VuZXJhdGVPcGVuQXBpRmlsZShwcm9wcy5hcGksIHByb3BzLnNjaGVtYXMpO1xuICB9XG59XG4iXX0=