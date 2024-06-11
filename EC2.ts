import * as aws from "@pulumi/aws";
import * as dotenv from "dotenv";
import { vpcId, vpcCidrBlock, privateSubnetId, publicSubnetId } from "./vpc";

dotenv.config();

const bastionServerSG = new aws.ec2.SecurityGroup("ec2-dev-bastion-sg", {
  vpcId,
  description: "Allowing SSH and HTTP only",
  ingress: [
    {
      protocol: "tcp",
      fromPort: 22,
      toPort: 22,
      cidrBlocks: ["0.0.0.0/0"]
    },
    {
      protocol: "tcp",
      fromPort: 80,
      toPort: 80,
      cidrBlocks: ["0.0.0.0/0"]
    }
  ],
  egress: [
    {
      protocol: "-1", // Allow all protocols
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ["0.0.0.0/0"]
    }
  ],
  tags: {
    Name: "ec2-dev-bastion-sg"
  }
});

const primaryServerSG = new aws.ec2.SecurityGroup("ec2-dev-primary-sg", {
  vpcId,
  description: "Allowing SSH and HTTP only",
  ingress: [
    {
      protocol: aws.ec2.ProtocolType.TCP,
      fromPort: 22,
      toPort: 22,
      cidrBlocks: [vpcCidrBlock]
    },
    {
      protocol: aws.ec2.ProtocolType.ICMP,
      fromPort: -1,
      toPort: -1,
      cidrBlocks: [vpcCidrBlock]
    }
  ],
  egress: [
    {
      protocol: "-1", // Allow all protocols
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ["0.0.0.0/0"]
    }
  ],
  tags: {
    Name: "ec2-dev-primary-sg"
  }
});

const ec2KeyPair = new aws.ec2.KeyPair("ec2-dev-kp", {
  keyName: "ec2-dev-kp",
  publicKey: process.env.PUBLIC_KEY!
});

const bastionInstance = new aws.ec2.Instance("ec2-dev-bastion-instance", {
  instanceType: "t2.small",
  ami: "ami-04b70fa74e45c3917", //Ubuntu, 24.04 LTS
  keyName: ec2KeyPair.keyName,
  vpcSecurityGroupIds: [bastionServerSG.id],
  subnetId: publicSubnetId,
  tags: {
    Name: "ec2-dev-bastion-instance"
  }
});

const primaryInstance = new aws.ec2.Instance(
  "ec2-dev-primary-instance",
  {
    instanceType: "t2.small",
    ami: "ami-04b70fa74e45c3917", //Ubuntu, 24.04 LTS
    keyName: ec2KeyPair.keyName,
    vpcSecurityGroupIds: [primaryServerSG.id],
    subnetId: privateSubnetId,
    tags: {
      Name: "ec2-dev-primary-instance"
    }
  },
  {
    dependsOn: [primaryServerSG]
  }
);

export const bastionInstanceArn = bastionInstance.arn;
export const primaryInstanceArn = primaryInstance.arn;
