# Custom Embed Specification

All communication goes through browser postMessage API. There are 3 types of plugin:

- Search Plugin
- View Plugin
- Edit Plugin

## Search integration with Ellipsis

When user add a Custom Embed element into ellipsis, Search Modal should appear. Depending on which Custom Embed subtype being added, a correspondent searchApi should be used to load search user experience.
Search integration may receive any arbitrary data through URL. However, Custom Embed subtype is the only piece of information required.

## View integration with Ellipsis

Ellipsis may require display Custom Embed type from the editor itself, related content or featured media panel. In order to do that Ellipsis will create an iframe and provide iframe src with the link to the preconfigured viewApi endpoint. Ellipsis will make any necessary substitution to the viewApi URL from ANS to make proper URL.
note: View integration should not have Edit controls. Ellipsis should initiate editing.

## Edit integration with Ellipsis

Pretty much the same as view integration, except Ellipsis will be waiting for the submit or cancel message from the iframe content. Submit message should have well-formed Custom Embed ANS in it with all the updates. Edit integration may have a cancel button along with Submit button for the better UI. However, Ellipsis may cancel editing at any time just by removing that iframe. No message will be sent to the Edit integration.
note: Integration developers encouraged not to save any data in the underlying systems at all, since all information should be carried over by Custom Embed ANS. If Edit integration designed to save some of the data to the underlying system, it should not assume that Ellipsis will inform integration in any way if user cancelled editing.

## Iframe communication protocol outline

Search, view and edit integration should send a handshake postMessage to the parent window as soon as it is loaded and ready to receive commands or interact with the user. If Ellipsis does not receive initial handshake message, Ellipsis will display an error information with the Retry button.

Search integration expected to return a configuration JSON on success search. Configuration JSON is a subject of validation, see below.

View integration is expected to send only handshake message. View integration receives configuration in a form of a query string. (base64/encoded, tbd)

Edit integration receives configuration in a form of a query string. (base64/encoded, tbd). Edit integration is expected to send handshake message and the configuration JSON on changes submit. If user discard changes, a cancel message should be send. Configuration JSON is a subject of validation, see below.

Each integration should be supplied with a `k` query string argument. This key is suppose to be used as simple cookie value and returned back with any message in the `key` field. This helps Ellipsis to identify which integration responds.

# Validation

Custom Embed configuration has the following limitations:

- Configuration should be a valid JSON
- JSON size should be no more than 2048 bytes length (TBD)
- JSON should not have type, version or referent fields at any level. Ellipsis will strip that out

Iframe communication protocol specification

Ellipsis communicate with plugins though query string data. This data is arbitrary and servers a purpose of plugin configuration. Custom embed data is passed as URL encoded data in a p parameter in a form of JSON.

Example:

    editApi.html?k=j0a&p=%7B%22id%22%3A%2217b3224337d2d3%22%2C%22url%22%3A%22https%3A%2F%2Fmy.content.com%2Fdata%2F5%22%2C%22config%22%3A%7B%22id%22%3A5%2C%22text%22%3A%22Brunch%20raclette%20vexillologist%20post-ironic%20glossier%20ennui%20XOXO%20mlkshk%20godard%20pour-over%20blog%20tumblr%20humblebrag.%22%2C%22image_id%22%3A30%7D%7D

Plugins should response back through browser postMessage mechanism. Each message should be a JSON object and contain the following fields:

- source - always equal to custom_embed
- action - can be ready, data, cancel
- key - a value from `k` query string parameter. Should be passed as-is
- data - contain custom embed data or content height of the iframe

Ready message

Ready message should be send by a plugins as soon as it renders their content and content height is known.

    {"source":"custom_embed","action":"ready","key":"j0a","data":{"height":908}}

If ready message will not be sent within ~10 seconds, Ellipsis will render a timeout error and plugin content will be discarded.

Data message

Data message should be send by search plugin when an item has been selected by user or edit plugin when editing is done. Data message should contain an embed data structure. Feel free to check the schema.

    {
      "source":"custom_embed",
      "action":"data",
      "key":"j0a",
      "data":{
        "id":"b0bc95dc11919",
        "url":"https://my.content.com/data/2",
        "config":{
          "id":2,
          "text":"Some Text",
          "image_id":1
        }
      }
    }

A data field should contain id, url and config fields. Those are required. Config object might have any arbitrary data structure. The only requirement is that it should not have referent, type and version fields. Config object should have as few fields as possible to properly configure the custom embed object. Please do not put large objects here. Instead, use data.id to identify internal resource and data.config to store configuration properties only.

Cancel message

Cancel message is used to notify Ellipsis that user wants to cancel search or discard any editing changes.

    {"source":"custom_embed","action":"cancel","key":"j0a"}

Cancel message notify Ellipsis to close the UI. It does nothing for the view integration and should not be used there.

Ellipsis can close search or edit iframe by itself without notifying iframe content. Please consider this behavior and do not persist any changes in the system. The only proper way to persist changes is to send data through data message back to the ellipsis.

Message communication example

| Ellipsis                           | Plugin                                                                                        |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| Ellipsis load a Search Integration |                                                                                               |
|                                    | Integration loads and send back Ready message                                                 |
|                                    | ← {"source":"custom_embed","action":"ready","key":"j0a","data":{"height":908}}                            |
|                                    | User select necessary media                                                                   |
|                                    | ← {"source":"custom_embed","action":"data","key":"j0a","data":{…}}                                        |
| Ellipsis load View Integration     |                                                                                               |
| viewApi.html?p=….                  | View integration renders it’s content and send back ready<br>message with the content height. |
|                                    | ← {"source":"custom_embed","action":"ready","key":"j0a","data":{"height":480}}                            |
| Ellipsis load Edit Integration     |                                                                                               |
| editApi.html?p=….                  | Edit integration renders it’s content and send back ready<br>message with the content height. |
|                                    | ← {"source":"custom_embed","action":"ready","key":"j0a","data":{"height":890}}                            |
|                                    | User accepted changes                                                                         |
|                                    | ← {"source":"custom_embed","action":"data","key":"j0a","data":{…}}                                        |
|                                    | /or/ User cancelled changes                                                                   |
|                                    | ← {"source":"custom_embed","action":"cancel","key":"j0a"}                                                 |
