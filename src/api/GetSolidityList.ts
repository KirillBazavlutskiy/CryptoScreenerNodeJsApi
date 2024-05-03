import {SolidityFinderService} from "../services/SolidityFinderService/SolidityFinderService.service";
import {SolidityModel} from "../models/SolidityFinderModels.model";
import {Request, Response} from "express";

let SolidityList: SolidityModel[] = [];
const SFS = new SolidityFinderService();

SFS.FindAllSolidity(100000, 0, 0).then(data => SolidityList = data)

setInterval(async () => {
  SolidityList = await SFS.FindAllSolidity(100000, 0, 0);
}, 5 * 60 * 1000);

export function GetSolidityListHandler(req: Request, res: Response<SolidityModel[]>) {
  res.send(SolidityList);
}