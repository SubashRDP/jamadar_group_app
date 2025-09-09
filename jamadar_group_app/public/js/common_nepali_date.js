frappe.require([
    "/assets/jamadar_app/css/nepali.datepicker.v4.0.8.min.css",
    "/assets/jamadar_app/js/nepali.datepicker.v4.0.8.min.js"
], function() {
    let $ = frappe.$ || jQuery;

    // Use $(document).ready instead of frappe.ready
    $(document).ready(function() {
        console.log("jQuery version:", $.fn.jquery); // Debugging

        function applyNepaliDateLogic(frm) {
            let date_field = frm.fields_dict.posting_date ? "posting_date" :
                            frm.fields_dict.transaction_date ? "transaction_date" :
                            frm.fields_dict.date ? "date" : null;

            if (!date_field || !frm.fields_dict.custom_nepali_date) {
                console.log("Required fields not found, skipping:", frm.doc.doctype);
                return;
            }

            let nepali_date_field = frm.fields_dict.custom_nepali_date.$input;
            if (nepali_date_field && $(nepali_date_field).length) {
                $(nepali_date_field).nepaliDatePicker({
                    dateFormat: "YYYY-MM-DD",
                    onChange: function(date) {
                        try {
                            console.log("Nepali date changed:", date.object);
                            frm.set_value("custom_nepali_date", date.object);
                            let ad_date = NepaliFunctions.BS2AD(date.object);
                            frm.set_value(date_field, ad_date);
                        } catch (e) {
                            frappe.msgprint(__("Error converting Nepali date to Gregorian: {0}", [e.message]));
                            console.error("Nepali to Gregorian conversion error:", e);
                        }
                    }
                });
            } else {
                console.log("Nepali date input not found for", frm.doc.doctype);
                return;
            }

            if (frm.doc[date_field] && !frm.doc.custom_nepali_date) {
                try {
                    let bs_date = NepaliFunctions.AD2BS(frm.doc[date_field], "YYYY-MM-DD");
                    frm.set_value("custom_nepali_date", bs_date);
                } catch (e) {
                    frappe.msgprint(__("Error converting Gregorian date to Nepali: {0}", [e.message]));
                    console.error("Gregorian to Nepali conversion error:", e);
                }
            }
        }

        function attachEventHandlers(doctype) {
            console.log("Attaching event handlers for DocType:", doctype);
            frappe.ui.form.on(doctype, {
                refresh: function(frm) {
                    console.log("Refresh triggered for", frm.doc.doctype);
                    applyNepaliDateLogic(frm);
                },
                posting_date: function(frm) {
                    if (frm.doc.posting_date) {
                        try {
                            console.log("posting_date changed:", frm.doc.posting_date);
                            let bs_date = NepaliFunctions.AD2BS(frm.doc.posting_date, "YYYY-MM-DD");
                            if (bs_date) {
                                frm.set_value("custom_nepali_date", bs_date);
                            }
                        } catch (e) {
                            frappe.msgprint(__("Error converting posting_date to Nepali: {0}", [e.message]));
                            console.error("posting_date conversion error:", e);
                        }
                    }
                },
                transaction_date: function(frm) {
                    if (frm.doc.transaction_date) {
                        try {
                            console.log("transaction_date changed:", frm.doc.transaction_date);
                            let bs_date = NepaliFunctions.AD2BS(frm.doc.transaction_date, "YYYY-MM-DD");
                            if (bs_date) {
                                frm.set_value("custom_nepali_date", bs_date);
                            }
                        } catch (e) {
                            frappe.msgprint(__("Error converting transaction_date to Nepali: {0}", [e.message]));
                            console.error("transaction_date conversion error:", e);
                        }
                    }
                },
                date: function(frm) {
                    if (frm.doc.date) {
                        try {
                            console.log("date changed:", frm.doc.date);
                            let bs_date = NepaliFunctions.AD2BS(frm.doc.date, "YYYY-MM-DD");
                            if (bs_date) {
                                frm.set_value("custom_nepali_date", bs_date);
                            }
                        } catch (e) {
                            frappe.msgprint(__("Error converting date to Nepali: {0}", [e.message]));
                            console.error("date conversion error:", e);
                        }
                    }
                },
                custom_nepali_date: function(frm) {
                    if (frm.doc.custom_nepali_date) {
                        try {
                            console.log("custom_nepali_date changed:", frm.doc.custom_nepali_date);
                            let ad_date = NepaliFunctions.BS2AD(frm.doc.custom_nepali_date);
                            let date_field = frm.fields_dict.posting_date ? "posting_date" :
                                            frm.fields_dict.transaction_date ? "transaction_date" :
                                            frm.fields_dict.date ? "date" : null;
                            if (date_field) {
                                frm.set_value(date_field, ad_date);
                            }
                        } catch (e) {
                            frappe.msgprint(__("Error converting Nepali date to Gregorian: {0}", [e.message]));
                            console.error("custom_nepali_date conversion error:", e);
                        }
                    }
                }
            });
        }

        frappe.router.on("change", function() {
            let route = frappe.get_route();
            console.log("Current route:", route);
            let doctype = route && route[1];

            if (!route || route[0] !== "Form" || !doctype) {
                console.log("Not in form view or no DocType, skipping:", route);
                return;
            }

            attachEventHandlers(doctype);
        });
    });
});