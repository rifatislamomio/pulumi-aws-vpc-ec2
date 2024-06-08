import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";

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
