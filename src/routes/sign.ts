import { Router, Request, Response, json } from 'express';
import { Curve, CurveName, RingSignature, Point } from '../../../types-Ring-Signature';
import { SignatureConfig } from '../../../types-Ring-Signature';
import { getBench32AddressFromPoint, BitcoinNetwork, getXRPLAddressfromPoint, ethAddressFromPoint } from '../utils';
import { Ring } from '../ring';
import pinataSDK from "@pinata/sdk";

const pinata = new pinataSDK({
  pinataJWTKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5NzdkZTNjYi0wNzNjLTQzZTgtYjQ2My00MDEzNjY1MWZmNzEiLCJlbWFpbCI6InRob21hc0BjeXBoZXJsYWIuZnIiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYjI0ZjE1NWJhYzgzN2E4Zjk5ZTYiLCJzY29wZWRLZXlTZWNyZXQiOiI0OGZkMGEyMDg3Njk4ZDU2M2I3ZjY2ZGZiYjA5Y2MxMDRhYjYxMmMzYjFmNTk3NGZlYjcxNGNjNDkzODU0YzkxIiwiaWF0IjoxNzAxOTY4NzEwfQ.4s2mNjQleIrOltm5Z2Q9qX4gIHE4lVwB8GDD0a9Xp5E'
});

const router = Router();
router.use(json());

interface SignPayload {
  ring: [string, string][]; // [x, y][]
  network: 'BTC' | 'XRP' | 'ETH' | 'MATIC' | 'AVAX' | 'ZkEVM'; // Supported networks
  amount: number; // Amount to send
  privKey: string; // User private key -> easier for proof of concept (POC)
}

// POST route to sign payload
router.post('/', async (req: Request, res: Response) => {
  try {
    const payload: SignPayload = req.body;
    const ring: bigint[][] = Ring;

    // sign
    const config: SignatureConfig = {
      evmCompatibility: true,
    };

    const curve = new Curve(CurveName.SECP256K1);
    const signature = RingSignature.sign(
      ring.map((point) => new Point(curve, [BigInt(point[0]), BigInt(point[1])])),
      BigInt('0x' + payload.privKey),
      JSON.stringify({ amount: payload.amount, network: payload.network }),
      curve,
      config
    );

    let sigData;
    if (payload.network === 'BTC') {
      sigData = {
        message: signature?.messageDigest.toString(),
        proof: signature?.getMessage().toString(),
        c: signature?.getChallenge().toString(),
        responses: signature.getResponses().map((response) => response.toString()),
        ring: signature.getRing().map((point) => [point.x.toString(), point.y.toString()]).flat(),
        ringAddress: signature.getRing().map((point) =>
        getBench32AddressFromPoint([point.x, point.y], BitcoinNetwork.TESTNET))
      };
      const CID = await pinata.pinJSONToIPFS(sigData);

      const out = {
        message: signature?.messageDigest.toString(),
        c: signature?.getChallenge().toString(),
        responses: signature.getResponses().map((response) => response.toString()),
        ringAddress: signature.getRing().map((point) =>
          getBench32AddressFromPoint([point.x, point.y], BitcoinNetwork.TESTNET)
        ),
        ring: signature.getRing().map((point) => [point.x.toString(), point.y.toString()]).flat(),
        CID: CID,
      };
      res.status(200).json(out);
    } else if (payload.network === 'XRP') {
      sigData = {
        message: signature?.messageDigest.toString(),
        proof: signature?.getMessage().toString(),
        c: signature?.getChallenge().toString(),
        responses: signature.getResponses().map((response) => response.toString()),
        ring: signature.getRing().map((point) => [point.x.toString(), point.y.toString()]).flat(),
        ringAddress: signature.getRing().map((point) => getXRPLAddressfromPoint([point.x, point.y])),
      };
      const CID = await pinata.pinJSONToIPFS(sigData);

      const out = {
        message: signature?.messageDigest.toString(),
        c: signature?.getChallenge().toString(),
        responses: signature.getResponses().map((response) => response.toString()),
        ringAddress: signature.getRing().map((point) => getXRPLAddressfromPoint([point.x, point.y])),
        ring: signature.getRing().map((point) => [point.x.toString(), point.y.toString()]).flat(),
        CID: CID,
      };
      res.status(200).json(out);

    }else if (payload.network === "AVAX" || payload.network === 'ETH' || payload.network ==='MATIC'  || payload.network ==='ZkEVM'){
      sigData = {
        message: signature?.messageDigest.toString(),
        proof: signature?.getMessage().toString(),
        c: signature?.getChallenge().toString(),
        responses: signature.getResponses().map((response) => response.toString()),
        ring: signature.getRing().map((point) => [point.x.toString(), point.y.toString()]).flat(),
        ringAddress: signature.getRing().map((point) =>
          ethAddressFromPoint([point.x, point.y])
        )
      };
      const CID = await pinata.pinJSONToIPFS(sigData);

      const out = {
        message: signature?.messageDigest.toString(),
        c: signature?.getChallenge().toString(),
        responses: signature.getResponses().map((response) => response.toString()),
        ringAddress: signature.getRing().map((point) =>
          ethAddressFromPoint([point.x, point.y])
        ),
        ring: signature.getRing().map((point) => [point.x.toString(), point.y.toString()]).flat(),
        CID: CID,
      };
      res.status(200).json(out);
    } else {
      res.status(400).json({ error: 'Network not supported' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

export default router;