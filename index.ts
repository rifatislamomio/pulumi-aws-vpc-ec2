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

const publicSubnet = new aws.ec2.Subnet("vpc-dev-public-subnet", {
  vpcId: vpc.id,
  cidrBlock: "100.0.1.0/24",
  availabilityZone: "us-east-1a",
  mapPublicIpOnLaunch: true,
  tags: {
    Name: "vpc-dev-public-subnet"
  }
});

const igw = new aws.ec2.InternetGateway("vpc-dev-igw", {
  vpcId: vpc.id,
  tags: {
    Name: "vpc-dev-igw"
  }
});

const publicSubnetRouteTable = new aws.ec2.RouteTable(
  "vpc-dev-pvt-subnet-route-table",
  {
    vpcId: vpc.id,
    routes: [
      {
        cidrBlock: "0.0.0.0/0",
        gatewayId: igw.id
      }
    ]
  }
);

const publicSubnetRTAssociation = new aws.ec2.RouteTableAssociation(
  "vpc-dev-pub-subnet-rt-association",
  {
    subnetId: publicSubnet.id,
    routeTableId: publicSubnetRouteTable.id
  }
);

const bastionServerSG = new aws.ec2.SecurityGroup("ec2-dev-bastion-sg", {
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
    Name: "ec2-dev-bastion-sg"
  }
});

const primaryServerSG = new aws.ec2.SecurityGroup("ec2-dev-primary-sg", {
  vpcId: vpc.id,
  description: "Allowing SSH and HTTP only",
  ingress: [
    {
      protocol: aws.ec2.ProtocolType.TCP,
      fromPort: 22,
      toPort: 22,
      cidrBlocks: [vpc.cidrBlock]
    },
    {
      protocol: aws.ec2.ProtocolType.All,
      fromPort: 0,
      toPort: 0,
      cidrBlocks: [vpc.cidrBlock]
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

const privateSubnet = new aws.ec2.Subnet("vpc-dev-private-subnet", {
  vpcId: vpc.id,
  cidrBlock: "100.0.2.0/24",
  availabilityZone: "us-east-1a",
  tags: {
    Name: "vpc-dev-private-subnet"
  }
});

const elasticIp = new aws.ec2.Eip("natgw-eip", {
  vpc: true,
  tags: {
    Name: "natgw-eip"
  }
});

const natGW = new aws.ec2.NatGateway("vpc-dev-nat-gw", {
  subnetId: publicSubnet.id,
  connectivityType: "public",
  allocationId: elasticIp.allocationId,
  tags: {
    Name: "vpc-dev-nat-gw"
  }
});

const privateSubnetRT = new aws.ec2.RouteTable("vpc-dev-private-subnet-rt", {
  vpcId: vpc.id,
  routes: [
    {
      cidrBlock: "0.0.0.0/0",
      natGatewayId: natGW.id
    }
  ]
});

const privateSubnetRTSubnetAssociation = new aws.ec2.RouteTableAssociation(
  "vpc-dev-pvt-subnet-rt-association",
  {
    subnetId: privateSubnet.id,
    routeTableId: privateSubnetRT.id
  }
);

const ec2KeyPair = new aws.ec2.KeyPair("ec2-dev-kp", {
  keyName: "ec2-dev-kp",
  publicKey: process.env.PUBLIC_KEY!
});

const bastionInstance = new aws.ec2.Instance("ec2-dev-bastion-instance", {
  instanceType: "t2.small",
  ami: "ami-04b70fa74e45c3917", //Ubuntu, 24.04 LTS
  keyName: ec2KeyPair.keyName,
  vpcSecurityGroupIds: [bastionServerSG.id],
  subnetId: publicSubnet.id,
  tags: {
    Name: "ec2-dev-bastion-instance"
  }
});

const primaryInstance = new aws.ec2.Instance("ec2-dev-primary-instance", {
  instanceType: "t2.small",
  ami: "ami-04b70fa74e45c3917", //Ubuntu, 24.04 LTS
  keyName: ec2KeyPair.keyName,
  vpcSecurityGroupIds: [primaryServerSG.id],
  subnetId: privateSubnet.id,
  tags: {
    Name: "ec2-dev-primary-instance"
  }
});
