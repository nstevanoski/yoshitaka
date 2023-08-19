import { HttpClient, HttpHeaders, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable } from 'rxjs'

@Injectable()
export class HttpService {
    private baseUrl: any;

    constructor(private _http: HttpClient) {
        this.baseUrl = environment.apiUrl;
    }

    get(url: any): Observable<any> {
        return this._http.get(this.baseUrl + url, {})
    }

    post(url: String, data: any): Observable<any> {
        const apiEndpoint = `${this.baseUrl}${url}`;
        console.log(`Reaching endpoint: ${apiEndpoint}`);
        return this._http.post(apiEndpoint, data, {});
    };

    put(url: String, data: any): Observable<any> {
        const apiEndpoint = `${this.baseUrl}${url}`;
        console.log(`Reaching endpoint: ${apiEndpoint}`);

        return this._http.put(apiEndpoint, data, {});
    };

    delete(url: String, id: any): Observable<any> {
        const apiEndpoint = `${this.baseUrl}${url}`;
        console.log(`Reaching endpoint: ${apiEndpoint}`);
        let options = {
        };
        return this._http.delete(apiEndpoint + "/" + id, options);
    };

}
