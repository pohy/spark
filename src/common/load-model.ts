import { Group, JSONLoader, Mesh, MeshPhongMaterial } from 'three';
import md5 = require('md5');
const jsonLoader = new JSONLoader();
const cache: any = {};

export function loadModel(jsonModel: any): Mesh {
    const name = md5(JSON.stringify(jsonModel));
    if (cache[name]) {
        const clone = cache[name].clone();
        clone.material = Array.isArray(clone.material)
            ? clone.material.map((material: MeshPhongMaterial) =>
                  material.clone(),
              )
            : clone.material.clone();
        return clone;
    }
    const { geometry, materials } = jsonLoader.parse(jsonModel);
    cache[name] = new Mesh(geometry, materials);
    return cache[name].clone();
}
