package com.electricity.billing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class ElectricityBillingApplication {

    public static void main(String[] args) {
        SpringApplication.run(ElectricityBillingApplication.class, args);
        System.out.println("=================================================");
        System.out.println("  Online Electricity Billing System is running!  ");
        System.out.println("  API base URL: http://localhost:8080/api        ");
        System.out.println("=================================================");
    }
}
