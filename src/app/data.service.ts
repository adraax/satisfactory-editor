import { Injectable } from '@angular/core';

import data from '../assets/output.json'
import { Building } from './interfaces/building.interface';

@Injectable()
export class DataService {
    private buildings: Map<string, Building> = new Map()
    constructor() {
        for (let k in data.buildings) {
            console.log(k)
            //this.buildings.set(k, data.buildings[k])
        }
        console.log(data)
    }
}
