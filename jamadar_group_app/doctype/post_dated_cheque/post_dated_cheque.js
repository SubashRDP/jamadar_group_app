// Copyright (c) 2025, subash and contributors
// For license information, please see license.txt

frappe.ui.form.on('Post Dated Cheque', {
    refresh: function(frm) {
        // Set status field options and default value
        frm.set_df_property('status', 'options', ['Pending', 'Approved', 'Rejected']);
        if (!frm.doc.status) {
            frm.set_value('status', 'Pending');
        }

        // Handle default payment_type and mandatory fields on form load
        if (frm.doc.payment_type === 'Receive') {
            frm.set_value('party_type', 'Customer');
            frm.toggle_display('received_amount', false);
            frm.set_value('received_amount', 0); // Set default to satisfy mandatory
            frm.toggle_reqd('received_amount', false); // Make non-mandatory when hidden
            frm.set_value('base_received_amount', 0); // Set default to satisfy mandatory
            frm.toggle_display('paid_amount', true); // Show paid_amount
            frm.toggle_display('base_paid_amount', true); // Show base_paid_amount
            frm.toggle_reqd('paid_amount', true); // Ensure mandatory
        } else if (frm.doc.payment_type === 'Pay') {
            frm.set_value('party_type', 'Supplier');
            frm.toggle_display('received_amount', true);
            frm.toggle_reqd('received_amount', true); // Ensure mandatory when visible
            frm.toggle_display('paid_amount', false); // Hide paid_amount
            frm.toggle_display('base_paid_amount', false); // Hide base_paid_amount
            frm.set_value('paid_amount', 0); // Set default to satisfy mandatory
            frm.toggle_reqd('paid_amount', false); // Make non-mandatory when hidden
            frm.set_value('base_paid_amount', 0); // Set default to satisfy mandatory
        } else if (frm.doc.payment_type === 'Internal Transfer') {
            frm.set_value('party_type', '');
            frm.toggle_display('received_amount', true);
            frm.toggle_reqd('received_amount', true); // Ensure mandatory when visible
            frm.toggle_display('paid_amount', true); // Show paid_amount
            frm.toggle_display('base_paid_amount', true); // Show base_paid_amount
            frm.toggle_reqd('paid_amount', true); // Ensure mandatory
        }
    },

    payment_type: function(frm) {
        // Handle changes to payment_type
        if (frm.doc.payment_type === 'Receive') {
            frm.set_value('party_type', 'Customer');
            frm.toggle_display('received_amount', false);
            frm.set_value('received_amount', 0); // Set default to satisfy mandatory
            frm.toggle_reqd('received_amount', false); // Make non-mandatory when hidden
            frm.set_value('base_received_amount', 0); // Set default to satisfy mandatory
            frm.toggle_display('paid_amount', true); // Show paid_amount
            frm.toggle_display('base_paid_amount', true); // Show base_paid_amount
            frm.toggle_reqd('paid_amount', true); // Ensure mandatory
        } else if (frm.doc.payment_type === 'Pay') {
            frm.set_value('party_type', 'Supplier');
            frm.toggle_display('received_amount', true);
            frm.toggle_reqd('received_amount', true); // Ensure mandatory when visible
            frm.toggle_display('paid_amount', false); // Hide paid_amount
            frm.toggle_display('base_paid_amount', false); // Hide base_paid_amount
            frm.set_value('paid_amount', 0); // Set default to satisfy mandatory
            frm.toggle_reqd('paid_amount', false); // Make non-mandatory when hidden
            frm.set_value('base_paid_amount', 0); // Set default to satisfy mandatory
        } else if (frm.doc.payment_type === 'Internal Transfer') {
            frm.set_value('party_type', '');
            frm.toggle_display('received_amount', true);
            frm.toggle_reqd('received_amount', true); // Ensure mandatory when visible
            frm.toggle_display('paid_amount', true); // Show paid_amount
            frm.toggle_display('base_paid_amount', true); // Show base_paid_amount
            frm.toggle_reqd('paid_amount', true); // Ensure mandatory
        }
        // Clear party and related fields when payment_type changes
        frm.set_value('party', '');
        frm.set_value('party_name', '');
        //frm.set_value('party_balance', 0);
        frm.set_value('bank_account', '');
        frm.set_value('party_bank_account', '');
        frm.set_value('base_paid_amount', 0); // Reset mandatory field
        frm.set_value('base_received_amount', 0); // Reset mandatory field
    },

    party: function(frm) {
        // Fetch party details when party is selected
        if (frm.doc.party && frm.doc.party_type) {
            frappe.call({
                method: 'frappe.client.get',
                args: {
                    doctype: frm.doc.party_type,
                    name: frm.doc.party
                },
                callback: function(r) {
                    if (r.message) {
                        let party = r.message;

                        // Set party_name
                        frm.set_value('party_name', party.customer_name || party.supplier_name || '');

                        // Fetch party balance
                        frappe.call({
                            method: 'erpnext.accounts.utils.get_balance_on',
                            args: {
                                party_type: frm.doc.party_type,
                                party: frm.doc.party,
                                date: frm.doc.posting_date || frappe.datetime.get_today(),
                                company: frm.doc.company
                            },
                            callback: function(balance_r) {
                                if (balance_r.message) {
                                    frm.set_value('party_balance', balance_r.message);
                                }
                            }
                        });

                        // // Fetch party bank account
                        // frappe.call({
                        //     method: 'frappe.client.get_value',
                        //     args: {
                        //         doctype: 'Bank Account',
                        //         filters: {
                        //             party_type: frm.doc.party_type,
                        //             party: frm.doc.party,
                        //             is_default: 1
                        //         },
                        //         fieldname: ['name']
                        //     },
                        //     callback: function(bank_r) {
                        //         if (bank_r.message && bank_r.message.name) {
                        //             frm.set_value('party_bank_account', bank_r.message.name);
                        //         } else {
                        //             frm.set_value('party_bank_account', '');
                        //         }
                        //     }
                        // });

                        // Fetch company bank account
                        frappe.call({
                            method: 'frappe.client.get_value',
                            args: {
                                doctype: 'Bank Account',
                                filters: {
                                    party_type: frm.doc.party_type,
                                    party: frm.doc.party,
                                    is_company_account: 1
                                },
                                fieldname: ['name']
                            },
                            callback: function(company_bank_r) {
                                if (company_bank_r.message && company_bank_r.message.name) {
                                    frm.set_value('bank_account', company_bank_r.message.name);
                                } else {
                                    frm.set_value('bank_account', '');
                                }
                            }
                        });
                    }
                }
            });
        } else {
            // Clear fields if no party is selected
            frm.set_value('party_name', '');
            //frm.set_value('party_balance', 0);
            frm.set_value('bank_account', '');
            frm.set_value('party_bank_account', '');
        }
    },

    paid_amount: function(frm) {
        // Update base_paid_amount (Company Currency) based on source_exchange_rate
        if (frm.doc.paid_amount && frm.doc.source_exchange_rate) {
            frm.set_value('base_paid_amount', frm.doc.paid_amount * frm.doc.source_exchange_rate);
        } else if (frm.doc.payment_type === 'Pay') {
            frm.set_value('base_paid_amount', 0); // Ensure mandatory field is set
        }
    },

    received_amount: function(frm) {
        // Update base_received_amount (Company Currency) based on target_exchange_rate
        if (frm.doc.received_amount && frm.doc.target_exchange_rate) {
            frm.set_value('base_received_amount', frm.doc.received_amount * frm.doc.target_exchange_rate);
        } else if (frm.doc.payment_type === 'Receive') {
            frm.set_value('base_received_amount', 0); // Ensure mandatory field is set
        }
    }
});