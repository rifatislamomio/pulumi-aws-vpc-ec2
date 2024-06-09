import * as aws from "@pulumi/aws";
import * as dotenv from "dotenv";

dotenv.config();

const vpc = new aws.ec2.Vpc("vpc-dev", {
  cidrBlock: "100.0.0.0/16",
  enableDnsHostnames: true,
  enableDnsSupport: true,
  tags: {
    Name: "vpc-dev"
  }
});

const subnet = new aws.ec2.Subnet("vpc-dev-subnet", {
  vpcId: vpc.id,
  cidrBlock: "100.0.1.0/24",
  mapPublicIpOnLaunch: true,
  tags: {
    Name: "vpc-dev-subnet"
  }
});

const igw = new aws.ec2.InternetGateway("vpc-dev-igw", {
  vpcId: vpc.id,
  tags: {
    Name: "vpc-dev-igw"
  }
});

const routeTable = new aws.ec2.RouteTable("vpc-dev-route-table", {
  vpcId: vpc.id,
  routes: [
    {
      cidrBlock: "0.0.0.0/0",
      gatewayId: igw.id
    }
  ]
});

const rtSubnetAssociation = new aws.ec2.RouteTableAssociation(
  "vpc-dev-rt-subnet-association",
  {
    subnetId: subnet.id,
    routeTableId: routeTable.id
  }
);

const securityGroup = new aws.ec2.SecurityGroup("ec2-dev-sg", {
  vpcId: vpc.id,
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
    Name: "ec2-dev-sg"
  }
});

const ec2KeyPair = new aws.ec2.KeyPair("ec2-dev-kp", {
  keyName: "ec2-dev-kp",
  publicKey: process.env.PUBLIC_KEY!
});

const ec2Instance = new aws.ec2.Instance("ec2-dev-instance", {
  instanceType: "t2.small",
  ami: "ami-04b70fa74e45c3917", //Ubuntu, 24.04 LTS
  keyName: ec2KeyPair.keyName,
  vpcSecurityGroupIds: [securityGroup.id],
  subnetId: subnet.id,
  tags: {
    Name: "ec2-dev-instance"
  }
});
