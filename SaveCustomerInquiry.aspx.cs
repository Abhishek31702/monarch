using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;

public partial class SaveCustomerInquiry : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        // Ensure only POST requests are handled
        if (Request.HttpMethod != "POST")
        {
            SendResponse("ERROR: Invalid request method");
            return;
        }

        try
        {
            // Get and validate form data
            string firstName = GetFormValue("firstName");
            string lastName = GetFormValue("lastName");
            string email = GetFormValue("email");
            string country = GetFormValue("country");
            string state = GetFormValue("state");
            string city = GetFormValue("city");
            string phone = GetFormValue("phone");
            string contactMethod = GetFormValue("contactMethod");

            // MULTIPLE CHECKBOX VALUES
            string videoProducts = Request.Form.GetValues("videoProducts") != null
                ? string.Join(", ", Request.Form.GetValues("videoProducts"))
                : "";
            string broadcastProducts = Request.Form.GetValues("broadcastProducts") != null
                ? string.Join(", ", Request.Form.GetValues("broadcastProducts"))
                : "";

            // Validate required fields
            if (string.IsNullOrWhiteSpace(firstName) ||
                string.IsNullOrWhiteSpace(lastName) ||
                string.IsNullOrWhiteSpace(email) ||
                string.IsNullOrWhiteSpace(country) ||
                string.IsNullOrWhiteSpace(city) ||
                string.IsNullOrWhiteSpace(phone) ||
                string.IsNullOrWhiteSpace(contactMethod))
            {
                SendResponse("ERROR: All required fields must be filled");
                return;
            }

            // Validate email format
            if (!IsValidEmail(email))
            {
                SendResponse("ERROR: Invalid email format");
                return;
            }

            // Validate phone format (remove formatting characters)
            string cleanPhone = Regex.Replace(phone, @"[^\d]", "");
            if (cleanPhone.Length < 10)
            {
                SendResponse("ERROR: Phone number must be at least 10 digits");
                return;
            }

            // Validate contact method
            string[] validMethods = { "phone_call", "email", "whatsapp" };
            if (!validMethods.Contains(contactMethod))
            {
                SendResponse("ERROR: Invalid contact method");
                return;
            }

            // Save to database
            string conString = ConfigurationManager.ConnectionStrings["dbCon"].ConnectionString;

            if (string.IsNullOrEmpty(conString))
            {
                SendResponse("ERROR: Database configuration error");
                return;
            }

            using (SqlConnection conn = new SqlConnection(conString))
            {
                string query = @"INSERT INTO CustomerInquiry
                                (FirstName, LastName, Email, Country, State, City, Phone, 
                                 ContactMethod, VideoProducts, BroadcastProducts)
                                VALUES
                                (@FirstName, @LastName, @Email, @Country, @State, @City, @Phone, 
                                 @ContactMethod, @VideoProducts, @BroadcastProducts)";

                SqlCommand cmd = new SqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@FirstName", firstName);
                cmd.Parameters.AddWithValue("@LastName", lastName);
                cmd.Parameters.AddWithValue("@Email", email);
                cmd.Parameters.AddWithValue("@Country", country);
                cmd.Parameters.AddWithValue("@State", string.IsNullOrWhiteSpace(state) ? DBNull.Value : (object)state);
                cmd.Parameters.AddWithValue("@City", city);
                cmd.Parameters.AddWithValue("@Phone", phone);
                cmd.Parameters.AddWithValue("@ContactMethod", contactMethod);
                cmd.Parameters.AddWithValue("@VideoProducts", videoProducts);
                cmd.Parameters.AddWithValue("@BroadcastProducts", broadcastProducts);

                conn.Open();
                cmd.ExecuteNonQuery();
                conn.Close();
            }

            SendResponse("SUCCESS"); // Clean response
        }
        catch (SqlException sqlEx)
        {
            System.Diagnostics.Debug.WriteLine("Database error: " + sqlEx.Message);
            SendResponse("ERROR: Database error occurred. Please try again later.");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Error: " + ex.Message);
            SendResponse("ERROR: An unexpected error occurred. Please try again.");
        }
    }

    private string GetFormValue(string key)
    {
        string value = Request.Form[key];
        return value != null ? value.Trim() : string.Empty;
    }

    private bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }

    // Helper to send clean response and stop further page processing
    private void SendResponse(string message)
    {
        Response.Clear();                  // Clear any previous content
        Response.ContentType = "text/plain";
        Response.Write(message);
        Response.Flush();
        Response.SuppressContent = true;   // Prevent ASPX page from rendering
        HttpContext.Current.ApplicationInstance.CompleteRequest();
    }
}