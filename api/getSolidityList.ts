import {SolidityFinderService} from "../services/SolidityFinderService/SolidityFinderService.service";
import {SolidityModel} from "../models/SolidityFinderModels.model";

const router = Router();
let SolidityList: SolidityModel[] = [];

setInterval(async () => {
  const SFS = new SolidityFinderService();
  SolidityList = await SFS.FindAllSolidity(100000, 0, 0, 0);
}, 5 * 60 * 1000);

router.get('/', (req: Request, res: Response<SolidityModel[]>) => {
  res.send(SolidityList);
});


export default router;
