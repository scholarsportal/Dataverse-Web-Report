import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {environment} from './../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  private listUrl: string;
  private metricsListEndpoint = '/api/metrics/list';
  private metricsReportEndpoint = '/api/metrics/report?';

  constructor(private http: HttpClient) {
  }

  getReportsList(): Observable<any> {
    this.listUrl = environment.apiUrl + this.metricsListEndpoint;
    return this.http.get(this.listUrl).pipe(catchError(this.handleError));
  }

  getReport(filename) {
    const reportUrl = environment.apiUrl + this.metricsReportEndpoint + 'filename=' + filename;
    return this.http.get(reportUrl, {responseType: 'text'}).pipe(catchError(this.handleError));
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }
}
