import * as aws from "@pulumi/aws";

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

export const vpcId = vpc.id;
export const vpcCidrBlock = vpc.cidrBlock;
export const publicSubnetId = publicSubnet.id;
export const privateSubnetId = privateSubnet.id;
