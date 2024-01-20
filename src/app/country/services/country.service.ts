import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../interfaces/country.interface';
import { Observable, combineLatest, map, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CountryService {
    private baseUrl = 'https://restcountries.com/v3.1'

    private _regions: Region[] = [
        Region.Africa, Region.Americas, Region.Asia, Region.Europe, Region.Oceania
    ]

    constructor(
        private httpClient: HttpClient
    ) { }

    get regions(): Region[] {
        return [...this._regions];
    }

    getSubregion(region: Region): Observable<SmallCountry[]> {
        if (!region) return of([]);

        const url: string = `${this.baseUrl}/region/${region}?fields=cca3,name,borders`;

        return this.httpClient.get<Country[]>(url)
            .pipe(
                //TODO toma la respuesta y puede transformar el resultado
                map(data => (
                    //TODO este map es de los arreglo no el de RxJS
                    data.map(country => ({ //<= esto se hace por que es un Arreglo de country
                        name: country.name.common,
                        cca3: country.cca3,
                        //TODO ?? Operador de coalencia nula si no se cumple el primero entrega el segundo valor
                        borders: country.borders ?? []
                    }))
                ))
            );
    }

    getCountryByAlphaCode(cca3: string): Observable<SmallCountry> {
        if (!cca3) return of();

        const url: string = `${this.baseUrl}/alpha/${cca3}?fields=cca3,name,borders`;

        return this.httpClient.get<Country>(url)
            .pipe(
                map(country => ({
                    name: country.name.common,
                    cca3: country.cca3,
                    borders: country.borders ?? []
                })
                )
            );
    }

    getCountryByCodes(borders: string[]): Observable<SmallCountry[]> {
        if (!borders || borders.length === 0) return of([]);

        const countryRequest: Observable<SmallCountry>[] = [];
        borders.forEach(code => {
            const request = this.getCountryByAlphaCode(code);
            countryRequest.push(request);
        });
        //TODO intruccion de RxJS para poder enviar un arreglo de Observables o Peticiones a una API.
        return combineLatest(countryRequest);
    }
}
