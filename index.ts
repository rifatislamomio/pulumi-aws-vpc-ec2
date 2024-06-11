import { privateSubnetId, publicSubnetId, vpcCidrBlock, vpcId } from "./vpc";
import { bastionInstanceArn, primaryInstanceArn } from "./ec2";

console.log({ vpcId, vpcCidrBlock, privateSubnetId, publicSubnetId });
console.log({ bastionInstanceArn, primaryInstanceArn });
