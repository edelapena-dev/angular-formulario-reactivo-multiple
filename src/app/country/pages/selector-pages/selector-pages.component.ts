import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountryService } from '../../services/country.service';
import { Country, Region, SmallCountry } from '../../interfaces/country.interface';
import { filter, switchMap, tap } from 'rxjs';

@Component({
    selector: 'app-selector-pages',
    templateUrl: './selector-pages.component.html',
    styles: ``
})
export class SelectorPagesComponent implements OnInit {

    public myform: FormGroup = this.fb.group({
        region: ['', Validators.required],
        country: ['', Validators.required],
        border: ['', Validators.required]
    });

    public countriesByRegion: SmallCountry[] = [];
    public borderByCountries: SmallCountry[] = [];

    constructor(
        private fb: FormBuilder,
        private countryService: CountryService
    ) { }

    ngOnInit(): void {
        this.onRegionChange();
        this.onCountryChange();
    }

    get regions(): Region[] {
        return this.countryService.regions;
    }

    onRegionChange(): void {
        //TODO cuando cambia el valor de Region o Continente
        this.myform.get('region')!.valueChanges
            .pipe(
                //TODO antes de solicitar los paises los limpiamos antes
                tap(() => this.myform.get('country')!.setValue("")),
                tap(() => this.borderByCountries = []),
                //TODO esto me permite poder recibir un observable y poder suscribir a otro observable
                //TODO obtiene el valor anterior region y lo envía a un Observable
                switchMap((region) => this.countryService.getSubregion(region))
            )
            .subscribe(countries => {
                this.countriesByRegion = countries;
            });
    }

    onCountryChange(): void {
        this.myform.get('country')!.valueChanges
            .pipe(
                tap(() => this.myform.get('border')!.setValue("")),
                filter((value: string) => value.length > 0), //TODO otra foorma de validar cuando el valor del border es blanco
                switchMap((country) => this.countryService.getCountryByAlphaCode(country)),
                switchMap((alphaCode) => this.countryService.getCountryByCodes(alphaCode.borders))
            )
            .subscribe(country => {
                this.borderByCountries = country;
            });
    }

}
